# n8n Chat
This is an embeddable Chat widget for n8n. It allows the execution of AI-Powered Workflows through a Chat window.

**Windowed Example**
![n8n Chat Windowed](https://raw.githubusercontent.com/n8n-io/n8n/master/packages/frontend/%40n8n/chat/resources/images/windowed.png)

**Fullscreen Example**
![n8n Chat Fullscreen](https://raw.githubusercontent.com/n8n-io/n8n/master/packages/frontend/%40n8n/chat/resources/images/fullscreen.png)

## Prerequisites
Create a n8n workflow which you want to execute via chat. The workflow has to be triggered using a **Chat Trigger** node.

Open the **Chat Trigger** node and add your domain to the **Allowed Origins (CORS)** field. This makes sure that only requests from your domain are accepted.

[See example workflow](https://github.com/n8n-io/n8n/blob/master/packages/%40n8n/chat/resources/workflow.json)

To use streaming responses, you need to enable the **Streaming response** response mode in the **Chat Trigger** node.
[See example workflow with streaming](https://github.com/n8n-io/n8n/blob/master/packages/%40n8n/chat/resources/workflow-streaming.json)

> Make sure the workflow is **Active.**

### How it works
Each Chat request is sent to the n8n Webhook endpoint, which then sends back a response.

Each request is accompanied by an `action` query parameter, where `action` can be one of:
- `loadPreviousSession` - When the user opens the Chatbot again and the previous chat session should be loaded
- `sendMessage` - When the user sends a message

## Installation

Open the **Webhook** node and replace `YOUR_PRODUCTION_WEBHOOK_URL` with your production URL. This is the URL that the Chat widget will use to send requests to.

### a. CDN Embed
Add the following code to your HTML page.

```html
<link href="https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css" rel="stylesheet" />
<script type="module">
	import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

	createChat({
		webhookUrl: 'YOUR_PRODUCTION_WEBHOOK_URL'
	});
</script>
```

### b. Import Embed
Install and save n8n Chat as a production dependency.

```sh
npm install @n8n/chat
```

Import the CSS and use the `createChat` function to initialize your Chat window.

```ts
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

createChat({
	webhookUrl: 'YOUR_PRODUCTION_WEBHOOK_URL'
});
```

##### Vue.js

```html
<script lang="ts" setup>
// App.vue
import { onMounted } from 'vue';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

onMounted(() => {
	createChat({
		webhookUrl: 'YOUR_PRODUCTION_WEBHOOK_URL'
	});
});
</script>
<template>
	<div></div>
</template>
```

##### React

```tsx
// App.tsx
import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export const App = () => {
	useEffect(() => {
		createChat({
			webhookUrl: 'YOUR_PRODUCTION_WEBHOOK_URL'
		});
	}, []);

	return (<div></div>);
};
```

## Options
The default options are:

```ts
createChat({
	webhookUrl: '',
	webhookConfig: {
		method: 'POST',
		headers: {}
	},
	target: '#n8n-chat',
	mode: 'window',
	showWindowResetButton: false,
	showAvatar: '',
	chatInputKey: 'chatInput',
	chatSessionKey: 'sessionId',
	loadPreviousSession: true,
	metadata: {},
	defaultLanguage: 'en',
	initialMessages: [
		'Hi there! 👋',
		'My name is Nathan. How can I assist you today?'
	],
	i18n: {
		en: {
			title: 'Hi there! 👋',
			footer: '',
			inputPlaceholder: 'Type your question..',
			resetButtonTooltip: 'Reset conversation',
		},
	},
	enableStreaming: false,
	showBotInfoMessage: false,
});
```

### `webhookUrl`
- **Type**: `string`
- **Required**: `true`
- **Examples**:
	- `https://yourname.app.n8n.cloud/webhook/513107b3-6f3a-4a1e-af21-659f0ed14183`
	- `http://localhost:5678/webhook/513107b3-6f3a-4a1e-af21-659f0ed14183`
- **Description**: The URL of the n8n Webhook endpoint. Should be the production URL.

### `webhookConfig`
- **Type**: `{ method: string, headers: Record<string, string> }`
- **Default**: `{ method: 'POST', headers: {} }`
- **Description**: The configuration for the Webhook request.

### `target`
- **Type**: `string`
- **Default**: `'#n8n-chat'`
- **Description**: The CSS selector of the element where the Chat window should be embedded.

### `mode`
- **Type**: `'window' | 'fullscreen'`
- **Default**: `'window'`
- **Description**: The render mode of the Chat window.
  - In `window` mode, the Chat window will be embedded in the target element as a chat toggle button and a fixed size chat window.
  - In `fullscreen` mode, the Chat will take up the entire width and height of its target container.

### `chatInputKey`
- **Type**: `string`
- **Default**: `'chatInput'`
- **Description**: The key to use for sending the chat input for the AI Agent node.

### `chatSessionKey`
- **Type**: `string`
- **Default**: `'sessionId'`
- **Description**: The key to use for sending the chat history session ID for the AI Memory node.

### `loadPreviousSession`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to load previous messages (chat context).

### `defaultLanguage`
- **Type**: `string`
- **Default**: `'en'`
- **Description**: The default language of the Chat window. Currently only `en` is supported.

### `i18n`
- **Type**: `{ [key: string]: { title: string, footer: string, inputPlaceholder: string, resetButtonTooltip: string, [key: string]: string } }`
- **Description**: The i18n configuration for the Chat window. Currently only `en` is supported.
  - `title`: The title displayed in the chat header
  - `footer`: The footer text displayed at the bottom of the chat (supports HTML)
  - `inputPlaceholder`: The placeholder text for the input field
  - `resetButtonTooltip`: The tooltip text for the reset button

### `initialMessages`
- **Type**: `string[]`
- **Description**: The initial messages to be displayed in the Chat window.

### `showWindowResetButton`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Whether to show a reset button in the chat header when in window mode. When clicked, it clears the chat history and starts a new session.

### `showAvatar`
- **Type**: `string`
- **Default**: `''`
- **Description**: URL of the avatar image to display in the chat toggle button and bot messages. If not provided, a default robot icon will be displayed.

### `showBotInfoMessage`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Whether to display bot avatar and name information in bot messages when available.

### `enableStreaming`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Whether to enable streaming responses from the n8n workflow. If set to `true`, the chat will display responses as they are being generated, providing a more interactive experience. For this to work the workflow must be configured as well to return streaming responses.

## Styling

The chat interface is built with **Tailwind CSS** and uses modern utility-first styling. The default appearance includes:

- **User messages**: Blue background (`bg-blue-600`) with white text
- **Bot messages**: Light gray background (`bg-zinc-200/50`) with dark text
- **Toggle button**: Black background with 56px size and subtle shadow
- **Typography**: Clean sans-serif fonts with proper spacing
- **Animations**: Smooth transitions and hover effects

### Custom Styling

You can customize the appearance by overriding the component styles using CSS. The main classes you can target include:

```css
/* User message styling */
.chat-message-user-content {
  /* Override user message appearance */
}

/* Bot message styling */
.chat-message-bot-content {
  /* Override bot message appearance */
}

/* Chat toggle button */
.chat-window-toggle {
  /* Override toggle button appearance */
}
```

### Avatar Customization

Use the `showAvatar` option to display a custom avatar in the chat toggle and bot messages:

```ts
createChat({
  showAvatar: 'https://your-domain.com/avatar.png',
  // ... other options
});
```

## Caveats

### Fullscreen mode
In fullscreen mode, the Chat window will take up the entire width and height of its target container. Make sure that the container has a set width and height.

```css
html,
body,
#n8n-chat {
	width: 100%;
	height: 100%;
}
```

## License

You can find the license information [here](https://github.com/n8n-io/n8n/blob/master/README.md#license)
