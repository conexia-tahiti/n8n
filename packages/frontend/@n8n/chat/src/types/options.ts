import type { Component, Ref } from 'vue';

export interface ChatOptions {
	webhookUrl: string;
	webhookConfig?: {
		method?: 'GET' | 'POST';
		headers?: Record<string, string>;
	};
	target?: string | Element;
	mode?: 'window' | 'fullscreen';
	showWindowResetButton?: boolean;
	showAvatar?: string;
	loadPreviousSession?: boolean;
	chatInputKey?: string;
	chatSessionKey?: string;
	defaultLanguage?: 'en';
	initialMessages?: string[];
	metadata?: Record<string, unknown>;
	i18n: Record<
		string,
		{
			title: string;
			footer: string;
			inputPlaceholder: string;
			resetButtonTooltip: string;
			[message: string]: string;
		}
	>;
	theme?: {};
	messageComponents?: Record<string, Component>;
	disabled?: Ref<boolean>;
	enableStreaming?: boolean;
	showBotInfoMessage?: boolean;
}
