<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { chatEventBus } from '@n8n/chat/event-buses';

const chatBodyRef = ref<HTMLElement | null>(null);

function scrollToBottom() {
	const element = chatBodyRef.value as HTMLElement;
	if (element) {
		element.scrollTop = element.scrollHeight;
	}
}

onMounted(() => {
	chatEventBus.on('scrollToBottom', scrollToBottom);
	window.addEventListener('resize', scrollToBottom);
});

onBeforeUnmount(() => {
	chatEventBus.off('scrollToBottom', scrollToBottom);
	window.removeEventListener('resize', scrollToBottom);
});
</script>
<template>
	<main class="group relative flex h-full flex-col bg-white shadow-lg backdrop-blur-sm">
		<header v-if="$slots.header" class="relative flex items-center justify-between px-5 text-black">
			<slot name="header" />
		</header>
		<div
			v-if="$slots.default"
			ref="chatBodyRef"
			class="-mb-2 relative flex-1 basis-full overflow-y-hidden scroll-smooth flex flex-col shadow-inner"
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
