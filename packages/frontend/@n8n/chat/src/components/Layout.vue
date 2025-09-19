<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { chatEventBus } from '@n8n/chat/event-buses';

const chatBodyRef = ref<HTMLElement | null>(null);

let scrollTimeout: number | null = null;

function scrollToBottom() {
	// Debounce scroll events to prevent multiple rapid scrolls
	if (scrollTimeout) {
		clearTimeout(scrollTimeout);
	}

	scrollTimeout = window.setTimeout(() => {
		const element = chatBodyRef.value as HTMLElement;
		if (element && element.scrollHeight > element.clientHeight) {
			// Ensure we're not accidentally scrolling the document body or html
			if (element === document.body || element === document.documentElement) {
				scrollTimeout = null;
				return;
			}

			// Only scroll if the element has scrollable content and is contained within the chat widget
			if (element.closest('[data-chat-widget]') || element.closest('.chat-container')) {
				// Ensure the element has a defined height and overflow
				const computedStyle = window.getComputedStyle(element);
				if (computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll') {
					element.scrollTop = element.scrollHeight;
				}
			}
		}
		scrollTimeout = null;
	}, 50);
}

onMounted(() => {
	chatEventBus.on('scrollToBottom', scrollToBottom);
	window.addEventListener('resize', scrollToBottom);
});

onBeforeUnmount(() => {
	chatEventBus.off('scrollToBottom', scrollToBottom);
	window.removeEventListener('resize', scrollToBottom);
	if (scrollTimeout) {
		clearTimeout(scrollTimeout);
		scrollTimeout = null;
	}
});
</script>
<template>
	<main
		class="group relative flex h-full flex-col bg-white shadow-lg backdrop-blur-sm"
		data-chat-widget
	>
		<header v-if="$slots.header" class="relative flex items-center justify-between px-5 text-black">
			<slot name="header" />
		</header>
		<div
			v-if="$slots.default"
			ref="chatBodyRef"
			class="-mb-2 relative flex-1 basis-full overflow-y-auto scroll-smooth flex flex-col shadow-inner"
		>
			<slot />
		</div>
		<div v-if="$slots.input" class="relative z-50 flex shrink-0 flex-col justify-end">
			<slot name="input" />
		</div>
		<footer
			v-if="$slots.footer"
			class="flex min-h-10 w-full max-w-full shrink-0 items-center justify-center gap-2 overflow-hidden text-nowrap px-4 pb-4 font-medium text-xs text-zinc-500 leading-[1.4]"
		>
			<slot name="footer" />
		</footer>
	</main>
</template>
