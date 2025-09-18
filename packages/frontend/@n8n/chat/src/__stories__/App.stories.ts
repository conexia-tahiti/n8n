import type { StoryObj } from '@storybook/vue3';
import { onMounted } from 'vue';

import { createChat } from '@n8n/chat/index';
import type { ChatOptions } from '@n8n/chat/types';

const webhookUrl = 'http://localhost:5678/webhook/YOUR_WEBHOOK_ID/chat';

const meta = {
	title: 'Chat',
	render: (args: Partial<ChatOptions>) => ({
		setup() {
			onMounted(() => {
				createChat(args);
			});

			return {};
		},
		template: '<div id="n8n-chat" />',
	}),
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Fullscreen: Story = {
	args: {
		webhookUrl,
		mode: 'fullscreen',
		enableStreaming: false,
	} satisfies Partial<ChatOptions>,
};

export const Windowed: Story = {
	args: {
		webhookUrl,
		mode: 'window',
		enableStreaming: false,
	} satisfies Partial<ChatOptions>,
};

export const WithCustomization: Story = {
	name: 'With Customization',
	args: {
		webhookUrl: 'https://your-n8n-instance.com/webhook/YOUR_WEBHOOK_ID/chat',
		mode: 'window',
		showWindowResetButton: true,
		showAvatar: 'https://via.placeholder.com/64x64/3B82F6/FFFFFF?text=AI',
		defaultLanguage: 'en',
		initialMessages: ["👋 Hi there! I'm your AI assistant", 'How can I help you today?'],
		i18n: {
			en: {
				title: 'AI Assistant',
				footer: 'Powered by n8n - Your data is secure and private',
				inputPlaceholder: 'Type your message here...',
				resetButtonTooltip: 'Reset conversation',
			},
		},
		enableStreaming: true,
		showBotInfoMessage: true,
	} satisfies Partial<ChatOptions>,
};
