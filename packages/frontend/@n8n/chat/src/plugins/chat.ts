import { v4 as uuidv4 } from 'uuid';
import { type Plugin, computed, nextTick, ref, type Ref } from 'vue';

import * as api from '@n8n/chat/api';
import { ChatOptionsSymbol, ChatSymbol, localStorageSessionIdKey } from '@n8n/chat/constants';
import { chatEventBus } from '@n8n/chat/event-buses';
import type {
	ChatMessage,
	ChatOptions,
	ChatMessageText,
	SendMessageResponse,
} from '@n8n/chat/types';
import { StreamingMessageManager, createBotMessage } from '@n8n/chat/utils/streaming';
import {
	handleStreamingChunk,
	handleNodeStart,
	handleNodeComplete,
} from '@n8n/chat/utils/streamingHandlers';

function createUserMessage(text: string): ChatMessage {
	return {
		id: uuidv4(),
		text,
		sender: 'user',
	};
}

function processMessageResponse(response: SendMessageResponse): string {
	let textMessage = response.output ?? response.text ?? response.message ?? '';

	if (textMessage === '' && Object.keys(response).length > 0) {
		try {
			textMessage = JSON.stringify(response, null, 2);
		} catch (e) {}
	}

	return textMessage;
}

interface EmptyStreamConfig {
	receivedMessage: Ref<ChatMessageText | null>;
	messages: Ref<ChatMessage[]>;
}

function handleEmptyStreamResponse(config: EmptyStreamConfig): void {
	const { receivedMessage, messages } = config;

	if (!receivedMessage.value) {
		receivedMessage.value = createBotMessage();
		messages.value.push(receivedMessage.value);
	} else {
		const hasContent = messages.value.some(
			(msg) => msg.sender === 'bot' && 'text' in msg && msg.text.trim().length > 0,
		);
		if (!hasContent) {
			receivedMessage.value = createBotMessage();
			messages.value.push(receivedMessage.value);
		}
	}
	receivedMessage.value.text =
		'[No response received. This could happen if streaming is enabled in the trigger but disabled in agent node(s)]';
}

interface ErrorConfig {
	error: unknown;
	receivedMessage: Ref<ChatMessageText | null>;
	messages: Ref<ChatMessage[]>;
}

function handleMessageError(config: ErrorConfig): void {
	const { error, receivedMessage, messages } = config;

	receivedMessage.value ??= createBotMessage();
	receivedMessage.value.text = 'Error: Failed to receive response';

	if (!messages.value.includes(receivedMessage.value)) {
		messages.value.push(receivedMessage.value);
	}

	console.error('Chat API error:', error);
}

interface StreamingMessageConfig {
	text: string;
	sessionId: string;
	options: ChatOptions;
	messages: Ref<ChatMessage[]>;
	receivedMessage: Ref<ChatMessageText | null>;
	streamingManager: StreamingMessageManager;
	waitingForResponse: Ref<boolean>;
}

async function handleStreamingMessage(config: StreamingMessageConfig): Promise<void> {
	const {
		text,
		sessionId,
		options,
		messages,
		receivedMessage,
		streamingManager,
		waitingForResponse,
	} = config;

	const handlers: api.StreamingEventHandlers = {
		onChunk: (chunk: string, nodeId?: string, runIndex?: number) => {
			handleStreamingChunk(
				chunk,
				nodeId,
				streamingManager,
				receivedMessage,
				messages,
				waitingForResponse,
				runIndex,
			);
		},
		onBeginMessage: (nodeId: string, runIndex?: number) => {
			handleNodeStart(nodeId, streamingManager, runIndex);
		},
		onEndMessage: (nodeId: string, runIndex?: number) => {
			handleNodeComplete(nodeId, streamingManager, runIndex);
		},
	};

	const { hasReceivedChunks } = await api.sendMessageStreaming(
		text,
		[],
		sessionId,
		options,
		handlers,
	);

	if (!hasReceivedChunks) {
		handleEmptyStreamResponse({ receivedMessage, messages });
	}
}

interface NonStreamingMessageConfig {
	text: string;
	sessionId: string;
	options: ChatOptions;
}

async function handleNonStreamingMessage(
	config: NonStreamingMessageConfig,
): Promise<{ response?: SendMessageResponse; botMessage?: ChatMessageText }> {
	const { text, sessionId, options } = config;

	const sendMessageResponse = await api.sendMessage(text, [], sessionId, options);

	if (sendMessageResponse?.executionStarted) {
		return { response: sendMessageResponse };
	}

	const receivedMessage = createBotMessage();
	receivedMessage.text = processMessageResponse(sendMessageResponse);
	return { botMessage: receivedMessage };
}

export const ChatPlugin: Plugin<ChatOptions> = {
	install(app, options) {
		app.provide(ChatOptionsSymbol, options);

		const messages = ref<ChatMessage[]>([]);
		const currentSessionId = ref<string | null>(null);
		const waitingForResponse = ref(false);

		const initialMessages = computed<ChatMessage[]>(() =>
			(options.initialMessages ?? []).map((text) => ({
				id: uuidv4(),
				text,
				sender: 'bot',
			})),
		);

		async function sendMessage(text: string): Promise<SendMessageResponse | null> {
			const sentMessage = createUserMessage(text);
			messages.value.push(sentMessage);
			waitingForResponse.value = true;

			void nextTick(() => {
				chatEventBus.emit('scrollToBottom');
			});

			const receivedMessage = ref<ChatMessageText | null>(null);
			const streamingManager = new StreamingMessageManager();

			try {
				if (options?.enableStreaming) {
					await handleStreamingMessage({
						text,
						sessionId: currentSessionId.value as string,
						options,
						messages,
						receivedMessage,
						streamingManager,
						waitingForResponse,
					});
				} else {
					const result = await handleNonStreamingMessage({
						text,
						sessionId: currentSessionId.value as string,
						options,
					});

					if (result.response?.executionStarted) {
						waitingForResponse.value = false;
						return result.response;
					}

					if (result.botMessage) {
						receivedMessage.value = result.botMessage;
						messages.value.push(result.botMessage);
					}
				}
			} catch (error) {
				handleMessageError({ error, receivedMessage, messages });
			} finally {
				waitingForResponse.value = false;
			}

			void nextTick(() => {
				chatEventBus.emit('scrollToBottom');
			});

			return null;
		}

		async function loadPreviousSession() {
			if (!options.loadPreviousSession) {
				return;
			}

			const sessionId = localStorage.getItem(localStorageSessionIdKey) ?? uuidv4();
			const previousMessagesResponse = await api.loadPreviousSession(sessionId, options);

			messages.value = (previousMessagesResponse?.data || []).map((message, index) => ({
				id: `${index}`,
				text: message.kwargs.content,
				sender: message.id.includes('HumanMessage') ? 'user' : 'bot',
			}));

			if (messages.value.length) {
				currentSessionId.value = sessionId;
			}

			return sessionId;
		}

		async function startNewSession() {
			messages.value = [];

			waitingForResponse.value = false;

			currentSessionId.value = uuidv4();

			localStorage.setItem(localStorageSessionIdKey, currentSessionId.value);
		}

		const chatStore = {
			initialMessages,
			messages,
			currentSessionId,
			waitingForResponse,
			loadPreviousSession,
			startNewSession,
			sendMessage,
		};

		app.provide(ChatSymbol, chatStore);
		app.config.globalProperties.$chat = chatStore;
	},
};
