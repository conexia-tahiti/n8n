<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

const props = withDefaults(
	defineProps<{
		animation?: 'bouncing' | 'scaling';
	}>(),
	{
		animation: 'bouncing',
	},
);

const messageContainer = ref<HTMLDivElement>();
const classes = computed(() => {
	return {
		[`chat-message-typing-animation-${props.animation}`]: true,
	};
});

const scrollToView = () => {
	if (messageContainer.value?.scrollIntoView) {
		messageContainer.value.scrollIntoView({
			block: 'start',
		});
	}
};

onMounted(() => {
	scrollToView();
});

defineExpose({ scrollToView });
</script>
<template>
	<div
		ref="messageContainer"
		class="relative flex w-full max-w-full flex-col items-baseline gap-1"
		data-test-id="chat-message-typing"
	>
		<div :class="classes" class="chat-message-bot-typing chat-message-typing">
			<div class="flex justify-center items-center">
				<span class="typing-dot block h-1.5 w-1.5 rounded-full bg-zinc-600 m-0.5"></span>
				<span class="typing-dot block h-1.5 w-1.5 rounded-full bg-zinc-600 m-0.5"></span>
				<span class="typing-dot block h-1.5 w-1.5 rounded-full bg-zinc-600 m-0.5"></span>
			</div>
		</div>
	</div>
</template>
<style scoped>
.chat-message-bot-typing {
	@apply hyphens-auto whitespace-normal text-wrap break-words text-left text-sm leading-5 antialiased px-4 py-3 bg-zinc-200/50 text-zinc-800 rounded-[20px];
	width: fit-content;
	max-width: 80px;
}

.chat-message-bot-typing.chat-message-typing-animation-scaling .typing-dot {
	animation: chat-message-typing-animation-scaling 800ms ease-in-out infinite;
	animation-delay: 3600ms;
}

.chat-message-bot-typing.chat-message-typing-animation-bouncing .typing-dot {
	animation: chat-message-typing-animation-bouncing 800ms ease-in-out infinite;
	animation-delay: 3600ms;
}

.chat-message-bot-typing .typing-dot:nth-child(1) {
	animation-delay: 0ms;
}

.chat-message-bot-typing .typing-dot:nth-child(2) {
	animation-delay: 333ms;
}

.chat-message-bot-typing .typing-dot:nth-child(3) {
	animation-delay: 666ms;
}

@keyframes chat-message-typing-animation-scaling {
	0% {
		transform: scale(1);
	}
	33% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.4);
	}
	100% {
		transform: scale(1);
	}
}

@keyframes chat-message-typing-animation-bouncing {
	0% {
		transform: translateY(0);
	}
	33% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-4px);
	}
	100% {
		transform: translateY(0);
	}
}
</style>
