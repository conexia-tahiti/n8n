<script setup lang="ts">
import IconRobotExcited from 'virtual:icons/mdi/robot-excited';
import Refresh from 'virtual:icons/mdi/refresh';
import { computed, nextTick, onMounted } from 'vue';

import Input from '@n8n/chat/components/Input.vue';
import Layout from '@n8n/chat/components/Layout.vue';
import MessagesList from '@n8n/chat/components/MessagesList.vue';
import { useI18n, useChat, useOptions } from '@n8n/chat/composables';
import { chatEventBus } from '@n8n/chat/event-buses';

const { t } = useI18n();
const chatStore = useChat();

const { messages, currentSessionId } = chatStore;
const { options } = useOptions();

const showResetButton = computed(() => options.mode === 'window' && options.showWindowResetButton);

async function initialize() {
	if (!chatStore.loadPreviousSession) {
		return;
	}
	await chatStore.loadPreviousSession();
	void nextTick(() => {
		chatEventBus.emit('scrollToBottom');
	});
}

async function resetChat() {
	if (chatStore.startNewSession) {
		await chatStore.startNewSession();
		void nextTick(() => {
			chatEventBus.emit('scrollToBottom');
		});
	}
}

onMounted(async () => {
	await initialize();
	if (!currentSessionId.value) {
		if (chatStore.startNewSession) {
			await chatStore.startNewSession();
			void nextTick(() => {
				chatEventBus.emit('scrollToBottom');
			});
		}
	}
});
</script>

<template>
	<Layout class="chat-wrapper">
		<template #header>
			<div class="my-4 flex h-10 items-center">
				<span
					class="relative flex shrink-0 overflow-hidden rounded-full mr-2 size-10 border border-white/[0.10] items-center justify-center"
				>
					<img
						v-if="options.showAvatar"
						:src="options.showAvatar"
						v-bind:alt="t('title')"
						class="w-full h-full object-cover"
					/>
					<IconRobotExcited v-else height="24" width="24" class="text-black" />
				</span>
				<div class="flex flex-col">
					<h1 class="font-medium text-sm tracking-tight">
						{{ t('title') }}
					</h1>
				</div>
			</div>
			<div class="flex items-center">
				<button
					v-if="showResetButton"
					class="flex border-none bg-transparent cursor-pointer transition-colors hover:animate-spin"
					:title="t('resetButtonTooltip')"
					@click="resetChat"
				>
					<Refresh height="20" width="20" />
				</button>
			</div>
		</template>
		<MessagesList :messages="messages" />
		<template #input>
			<Input v-if="currentSessionId" />
		</template>
		<template #footer>
			<div class="w-full overflow-x-hidden whitespace-pre-wrap break-words text-center">
				<div class="mb-1">
					{{ t('footer') }}
				</div>
				<div>
					<a
						href="https://conexia-agency.com/"
						target="_blank"
						rel="noopener noreferrer"
						class="font-bold underline hover:underline"
						>Service Conexia</a
					>
				</div>
			</div>
		</template>
	</Layout>
</template>
