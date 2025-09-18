<script lang="ts" setup>
import { ref, watch } from 'vue';

import Message from '@n8n/chat/components/Message.vue';
import MessageTyping from '@n8n/chat/components/MessageTyping.vue';
import { useChat } from '@n8n/chat/composables';
import type { ChatMessage } from '@n8n/chat/types';

defineProps<{
	messages: ChatMessage[];
}>();

defineSlots<{
	beforeMessage(props: { message: ChatMessage }): ChatMessage;
}>();

const chatStore = useChat();
const messageComponents = ref<Array<InstanceType<typeof Message>>>([]);
const { initialMessages, waitingForResponse } = chatStore;

watch(
	() => messageComponents.value.length,
	() => {
		const lastMessageComponent = messageComponents.value[messageComponents.value.length - 1];
		if (lastMessageComponent) {
			lastMessageComponent.scrollToView();
		}
	},
);
</script>
<template>
	<div
		class="scrollbar-minimal flex w-full flex-1 flex-col overflow-y-auto px-5 pt-5 sm:overscroll-contain"
	>
		<div class="flex flex-1 flex-col gap-1">
			<Message
				v-for="initialMessage in initialMessages"
				:key="initialMessage.id"
				:message="initialMessage"
			/>

			<template v-for="message in messages" :key="message.id">
				<Message ref="messageComponents" :message="message">
					<template #beforeMessage="{ message }">
						<slot name="beforeMessage" v-bind="{ message }" />
					</template>
				</Message>
			</template>
			<MessageTyping v-if="waitingForResponse" />
			<div class="relative bottom-0 mt-auto w-full pt-16"></div>
		</div>
	</div>
</template>
