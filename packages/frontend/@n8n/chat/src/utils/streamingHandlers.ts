import { nextTick } from 'vue';
import type { Ref } from 'vue';

import { chatEventBus } from '@n8n/chat/event-buses';
import type { ChatMessage, ChatMessageText } from '@n8n/chat/types';

import type { StreamingMessageManager } from './streaming';
import { createBotMessage, updateMessageInArray } from './streaming';

export function handleStreamingChunk(
	chunk: string,
	nodeId: string | undefined,
	streamingManager: StreamingMessageManager,
	receivedMessage: Ref<ChatMessageText | null>,
	messages: Ref<ChatMessage[]>,
	waitingForResponse: Ref<boolean>,
	runIndex?: number,
): void {
	try {
		if (chunk === '') {
			return;
		}

		waitingForResponse.value = false;

		if (!nodeId) {
			if (!receivedMessage.value) {
				receivedMessage.value = createBotMessage();
				messages.value.push(receivedMessage.value);
			}

			const updatedMessage: ChatMessageText = {
				...receivedMessage.value,
				text: receivedMessage.value.text + chunk,
			};

			updateMessageInArray(messages.value, receivedMessage.value.id, updatedMessage);
			receivedMessage.value = updatedMessage;
		} else {
			let runMessage = streamingManager.getRunMessage(nodeId, runIndex);
			if (!runMessage) {
				runMessage = streamingManager.addRunToActive(nodeId, runIndex);
				messages.value.push(runMessage);
			}

			const updatedMessage = streamingManager.addChunkToRun(nodeId, chunk, runIndex);
			if (updatedMessage) {
				updateMessageInArray(messages.value, updatedMessage.id, updatedMessage);
			}
		}

		void nextTick(() => {
			chatEventBus.emit('scrollToBottom');
		});
	} catch (error) {
		console.error('Error handling stream chunk:', error);
	}
}

export function handleNodeStart(
	nodeId: string,
	streamingManager: StreamingMessageManager,
	runIndex?: number,
): void {
	try {
		streamingManager.registerRunStart(nodeId, runIndex);
	} catch (error) {
		console.error('Error handling node start:', error);
	}
}

export function handleNodeComplete(
	nodeId: string,
	streamingManager: StreamingMessageManager,
	runIndex?: number,
): void {
	try {
		streamingManager.removeRunFromActive(nodeId, runIndex);
	} catch (error) {
		console.error('Error handling node complete:', error);
	}
}
