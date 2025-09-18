<script lang="ts" setup>
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import type MarkdownIt from 'markdown-it';
import markdownLink from 'markdown-it-link-attributes';
import IconRobotExcited from 'virtual:icons/mdi/robot-excited';
import { computed, ref, toRefs } from 'vue';
import VueMarkdown from 'vue-markdown-render';

import { useOptions } from '@n8n/chat/composables';
import type { ChatMessage, ChatMessageText } from '@n8n/chat/types';

const props = defineProps<{
	message: ChatMessage;
}>();

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('bash', bash);

defineSlots<{
	beforeMessage(props: { message: ChatMessage }): ChatMessage;
	default: { message: ChatMessage };
}>();

const { message } = toRefs(props);
const { options } = useOptions();
const messageContainer = ref<HTMLElement | null>(null);

const botAvatar = computed(() => options?.showAvatar);
const botName = computed(() => options?.i18n?.en?.title || '');
const showBotInfo = computed(() => options?.showBotInfoMessage);

const messageText = computed(() => {
	return (message.value as ChatMessageText).text || '&lt;Empty response&gt;';
});

const linksNewTabPlugin = (vueMarkdownItInstance: MarkdownIt) => {
	vueMarkdownItInstance.use(markdownLink, {
		attrs: {
			target: '_blank',
			rel: 'noopener',
		},
	});
};

const scrollToView = () => {
	if (messageContainer.value?.scrollIntoView) {
		messageContainer.value.scrollIntoView({
			block: 'start',
		});
	}
};

const markdownOptions = {
	highlight(str: string, lang: string) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(str, { language: lang }).value;
			} catch {}
		}

		return ''; // use external default escaping
	},
};

const messageComponents = { ...(options?.messageComponents ?? {}) };

defineExpose({ scrollToView });
</script>

<template>
	<div
		v-if="message.sender === 'user'"
		ref="messageContainer"
		class="relative flex w-full flex-col items-end gap-1"
	>
		<div class="chat-message-user-content">
			<slot>
				<template v-if="message.type === 'component' && messageComponents[message.key]">
					<component :is="messageComponents[message.key]" v-bind="message.arguments" />
				</template>
				<VueMarkdown
					v-else
					class="chat-message-markdown"
					:source="messageText"
					:options="markdownOptions"
					:plugins="[linksNewTabPlugin]"
				/>
			</slot>
		</div>
	</div>

	<div
		v-else
		ref="messageContainer"
		class="relative flex w-full max-w-full flex-col items-baseline gap-1"
	>
		<div class="chat-message-bot-content">
			<div v-if="showBotInfo && (botAvatar || botName)" class="flex items-center gap-2 mb-2">
				<div
					class="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-zinc-100"
				>
					<img
						v-if="botAvatar"
						:src="botAvatar"
						:alt="botName || 'Bot'"
						class="w-6 h-6 rounded-full object-cover"
					/>
					<IconRobotExcited v-else height="16" width="16" class="text-black" />
				</div>
				<span
					v-if="botName"
					class="font-medium text-sm text-zinc-950 leading-normal tracking-tight"
					>{{ botName }}</span
				>
			</div>

			<slot>
				<template v-if="message.type === 'component' && messageComponents[message.key]">
					<component :is="messageComponents[message.key]" v-bind="message.arguments" />
				</template>
				<VueMarkdown
					v-else
					class="chat-message-markdown"
					:source="messageText"
					:options="markdownOptions"
					:plugins="[linksNewTabPlugin]"
				/>
			</slot>
		</div>
	</div>
</template>

<style scoped>
.chat-message-user-content {
	@apply hyphens-auto text-wrap break-words rounded-[20px] text-left text-sm leading-5 antialiased ml-auto whitespace-normal px-4 py-3 font-sans bg-black text-white;
	max-width: min(calc(100% - 40px), 65ch);
	border-width: 0;
}

.chat-message-bot-content {
	@apply hyphens-auto whitespace-normal text-wrap break-words text-left text-sm leading-5 antialiased px-4 py-3 bg-zinc-200/50 text-zinc-800 rounded-[20px];
	max-width: min(calc(100% - 40px), 65ch);
	width: fit-content;
}

.chat-message-actions {
	@apply absolute left-0 opacity-0 -translate-y-1 flex gap-4;
	bottom: calc(100% - 0.5rem);
}

.chat-message-from-user .chat-message-actions {
	@apply left-auto right-0;
}

.relative:hover .chat-message-actions {
	@apply opacity-100;
}

.chat-message-markdown {
	@apply block box-border text-inherit;
}

.chat-message-markdown > *:first-child {
	@apply mt-0;
}

.chat-message-markdown > *:last-child {
	@apply mb-0;
}

.chat-message-markdown h1,
.chat-message-markdown h2,
.chat-message-markdown h3,
.chat-message-markdown h4,
.chat-message-markdown h5,
.chat-message-markdown h6 {
	@apply font-semibold leading-tight mt-6 mb-4;
}

.chat-message-markdown h1 {
	@apply text-2xl;
}

.chat-message-markdown h2 {
	@apply text-xl;
}

.chat-message-markdown h3 {
	@apply text-lg;
}

.chat-message-markdown h4 {
	@apply text-base font-semibold;
}

.chat-message-markdown h5 {
	@apply text-sm font-semibold;
}

.chat-message-markdown h6 {
	@apply text-sm font-medium;
}

:deep(.chat-message-markdown p) {
	@apply leading-relaxed break-words mb-1;
}

:deep(.chat-message-markdown p:last-child) {
	@apply mb-0;
}

:deep(.chat-message-markdown ul) {
	@apply mb-4 mt-4 pl-6 space-y-2;
	list-style-position: inside;
}

:deep(.chat-message-markdown ol) {
	@apply mb-4 mt-4 pl-6 space-y-2;
	list-style-position: inside;
}

:deep(.chat-message-markdown ul li) {
	@apply leading-relaxed;
	list-style-type: disc;
	display: list-item;
}

:deep(.chat-message-markdown ol li) {
	@apply leading-relaxed;
	list-style-type: decimal;
	display: list-item;
}

:deep(.chat-message-markdown li) {
	@apply text-sm;
}

.chat-message-markdown ul ul,
.chat-message-markdown ol ol,
.chat-message-markdown ul ol,
.chat-message-markdown ol ul {
	@apply ml-4 mt-1 mb-1;
}

.chat-message-markdown code {
	@apply px-1.5 py-0.5 bg-zinc-100 text-zinc-800 rounded text-sm font-mono;
}

.chat-message-markdown pre {
	@apply font-mono text-sm m-0 whitespace-pre-wrap box-border p-4 bg-zinc-100 rounded-lg mt-2 mb-4 overflow-x-auto;
}

.chat-message-markdown pre code {
	@apply px-0 py-0 bg-transparent text-inherit;
}

:deep(.chat-message-markdown a) {
	@apply text-zinc-700 underline font-bold hover:text-black transition-colors mt-1;
}

.chat-message-markdown strong {
	@apply font-semibold;
}

.chat-message-markdown em {
	@apply italic;
}

.chat-message-markdown del {
	@apply line-through;
}

.chat-message-markdown blockquote {
	@apply border-l-4 border-zinc-300 pl-4 py-2 my-4 bg-zinc-50 rounded-r;
}

.chat-message-markdown blockquote p {
	@apply mb-0 italic text-zinc-700;
}

.chat-message-markdown table {
	@apply w-full border-collapse my-4;
}

.chat-message-markdown th,
.chat-message-markdown td {
	@apply border border-zinc-300 px-3 py-2 text-left;
}

.chat-message-markdown th {
	@apply bg-zinc-100 font-semibold;
}

.chat-message-markdown tbody tr:nth-child(even) {
	@apply bg-zinc-50;
}

:deep(.chat-message-markdown hr) {
	@apply border-0 border-t border-zinc-300 my-6;
}

.chat-message-markdown br {
	content: '';
	display: block;
	margin-bottom: 0.75rem;
}

:deep(.chat-message-markdown img) {
	@apply rounded-lg mb-1 bg-white shadow-md;
	width: 160px;
	height: 160px;
	object-fit: cover;
}

.relative + .relative {
	@apply mt-3;
}
</style>
