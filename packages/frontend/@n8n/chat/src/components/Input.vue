<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import IconSend from 'virtual:icons/mdi/send';
import { computed, onMounted, onUnmounted, ref, unref } from 'vue';

import { useI18n, useChat, useOptions } from '@n8n/chat/composables';
import { chatEventBus } from '@n8n/chat/event-buses';
import { constructChatWebsocketUrl } from '@n8n/chat/utils';

import type { ChatMessage } from '../types';

export interface ChatInputProps {
	placeholder?: string;
}

const props = withDefaults(defineProps<ChatInputProps>(), {
	placeholder: 'inputPlaceholder',
});

export interface ArrowKeyDownPayload {
	key: 'ArrowUp' | 'ArrowDown';
	currentInputValue: string;
}

const { t } = useI18n();
const emit = defineEmits<{
	arrowKeyDown: [value: ArrowKeyDownPayload];
}>();

const { options } = useOptions();
const chatStore = useChat();
const { waitingForResponse } = chatStore;

const chatTextArea = ref<HTMLTextAreaElement | null>(null);
const input = ref('');
const isSubmitting = ref(false);
const resizeObserver = ref<ResizeObserver | null>(null);
const waitingForChatResponse = ref(false);

const isSubmitDisabled = computed(() => {
	if (waitingForChatResponse.value) return false;
	return input.value === '' || unref(waitingForResponse) || options.disabled?.value === true;
});

const isInputDisabled = computed(() => options.disabled?.value === true);

onMounted(() => {
	chatEventBus.on('focusInput', focusChatInput);
	chatEventBus.on('blurInput', blurChatInput);
	chatEventBus.on('setInputValue', setInputValue);

	if (chatTextArea.value) {
		resizeObserver.value = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target === chatTextArea.value) {
					adjustTextAreaHeight();
				}
			}
		});

		resizeObserver.value.observe(chatTextArea.value);
	}
});

onUnmounted(() => {
	chatEventBus.off('focusInput', focusChatInput);
	chatEventBus.off('blurInput', blurChatInput);
	chatEventBus.off('setInputValue', setInputValue);

	if (resizeObserver.value) {
		resizeObserver.value.disconnect();
		resizeObserver.value = null;
	}
});

function blurChatInput() {
	if (chatTextArea.value) {
		chatTextArea.value.blur();
	}
}

function focusChatInput() {
	if (chatTextArea.value) {
		chatTextArea.value.focus();
	}
}

function setInputValue(value: string) {
	input.value = value;
	focusChatInput();
}

function setupWebsocketConnection(executionId: string) {
	if (options.webhookUrl && chatStore.currentSessionId.value) {
		try {
			const wsUrl = constructChatWebsocketUrl(
				options.webhookUrl,
				executionId,
				chatStore.currentSessionId.value,
				true,
			);
			chatStore.ws = new WebSocket(wsUrl);
			chatStore.ws.onmessage = (e) => {
				if (e.data === 'n8n|heartbeat') {
					chatStore.ws?.send('n8n|heartbeat-ack');
					return;
				}

				if (e.data === 'n8n|continue') {
					waitingForChatResponse.value = false;
					chatStore.waitingForResponse.value = true;
					return;
				}
				const newMessage: ChatMessage = {
					id: uuidv4(),
					text: e.data,
					sender: 'bot',
				};

				chatStore.messages.value.push(newMessage);
				waitingForChatResponse.value = true;
				chatStore.waitingForResponse.value = false;
			};

			chatStore.ws.onclose = () => {
				chatStore.ws = null;
				waitingForChatResponse.value = false;
				chatStore.waitingForResponse.value = false;
			};
		} catch (error) {
			console.error('Error setting up websocket connection', error);
		}
	}
}

async function respondToChatNode(ws: WebSocket, messageText: string) {
	const sentMessage: ChatMessage = {
		id: uuidv4(),
		text: messageText,
		sender: 'user',
	};

	chatStore.messages.value.push(sentMessage);
	ws.send(
		JSON.stringify({
			sessionId: chatStore.currentSessionId.value,
			action: 'sendMessage',
			chatInput: messageText,
		}),
	);
	chatStore.waitingForResponse.value = true;
	waitingForChatResponse.value = false;
}

async function onSubmit(event: MouseEvent | KeyboardEvent) {
	event.preventDefault();

	if (isSubmitDisabled.value) {
		return;
	}

	const messageText = input.value;
	input.value = '';
	isSubmitting.value = true;

	if (chatStore.ws && waitingForChatResponse.value) {
		await respondToChatNode(chatStore.ws, messageText);
		return;
	}

	const response = await chatStore.sendMessage(messageText);

	if (response?.executionId) {
		setupWebsocketConnection(response.executionId);
	}

	isSubmitting.value = false;
}

async function onSubmitKeydown(event: KeyboardEvent) {
	if (event.shiftKey || event.isComposing) {
		return;
	}

	await onSubmit(event);
	adjustTextAreaHeight();
}

function onKeyDown(event: KeyboardEvent) {
	if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
		event.preventDefault();

		emit('arrowKeyDown', {
			key: event.key,
			currentInputValue: input.value,
		});
	}
}

function adjustTextAreaHeight() {
	const textarea = chatTextArea.value;
	if (!textarea) return;
	textarea.style.height = '20px';
	const newHeight = Math.min(textarea.scrollHeight, 480); // 30rem
	textarea.style.height = `${newHeight}px`;
}
</script>

<template>
	<div
		class="flex-row items-center px-4 py-2.5 relative z-50 mx-4 mb-4 flex min-h-13 rounded-2xl bg-white border-[1.5px] border-zinc-100 shadow-md focus-within:border-[1.5px] focus-within:border-zinc-950"
		@keydown.stop="onKeyDown"
	>
		<div v-if="$slots.leftPanel" class="w-8 ml-1.5">
			<slot name="leftPanel" />
		</div>
		<textarea
			ref="chatTextArea"
			v-model="input"
			data-test-id="chat-input"
			:disabled="isInputDisabled"
			:placeholder="t(props.placeholder)"
			class="field-sizing-content flex w-full rounded-md border-input bg-transparent text-base transition-color disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive file:font-medium file:text-foreground file:text-sm md:text-sm disabled:opacity-50 disabled:outline-none focus-visible:outline aria-invalid:outline-destructive/20 max-h-40 min-h-5 resize-none border-0 px-1 py-0 outline-none text-zinc-950 placeholder:text-zinc-400 group-data-[mobile=true]:text-[16px] sm:text-sm pointer-events-auto overflow-y-auto box-border appearance-none leading-tight focus-visible:ring-0 focus-visible:ring-offset-0 selection:bg-zinc-900 selection:text-white flex-1"
			@keydown.enter="onSubmitKeydown"
			@input="adjustTextAreaHeight"
			@mousedown="adjustTextAreaHeight"
			@focus="adjustTextAreaHeight"
		/>

		<div class="flex flex-row gap-1">
			<button
				:disabled="isSubmitDisabled"
				class="flex items-center justify-center gap-2 whitespace-nowrap font-medium text-sm outline-hidden transition-all duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 shadow-inner-sm rounded-md p-1.5 h-7 w-7 bg-transparent shadow-none hover:bg-zinc-100/90"
				@click="onSubmit"
			>
				<IconSend height="20" width="20" />
			</button>
		</div>
	</div>
</template>
