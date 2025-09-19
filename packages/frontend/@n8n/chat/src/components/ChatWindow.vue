<script lang="ts" setup>
import IconChat from 'virtual:icons/mdi/chat';
import IconChevronDown from 'virtual:icons/mdi/chevron-down';
import { computed, nextTick, ref } from 'vue';

import Chat from '@n8n/chat/components/Chat.vue';
import { useOptions } from '@n8n/chat/composables';
import { chatEventBus } from '@n8n/chat/event-buses';

const isOpen = ref(false);
const { options } = useOptions();

const avatarUrl = computed(() => {
	return options?.showAvatar &&
		typeof options.showAvatar === 'string' &&
		options.showAvatar.trim() !== ''
		? options.showAvatar
		: null;
});

function toggle() {
	isOpen.value = !isOpen.value;

	if (isOpen.value) {
		void nextTick(() => {
			chatEventBus.emit('scrollToBottom');
		});
	}
}
</script>

<template>
	<div
		class="fixed z-50 bottom-4 right-4 h-full w-full flex flex-col items-end justify-end gap-4 md:mx-auto md:my-auto md:max-h-[52rem] md:max-w-[28rem]"
	>
		<Transition
			enter-active-class="transition-all duration-150 ease-in-out"
			leave-active-class="transition-all duration-150 ease-in-out"
			enter-from-class="scale-0 opacity-0"
			enter-to-class="scale-100 opacity-100"
			leave-from-class="scale-100 opacity-100"
			leave-to-class="scale-0 opacity-0"
		>
			<div
				v-show="isOpen"
				class="h-full w-full overflow-hidden border-[1px] border-zinc-100 md:rounded-[20px]"
			>
				<Chat />
			</div>
		</Transition>
		<div
			class="flex-none bg-black text-white cursor-pointer w-14 h-14 rounded-full inline-flex items-center justify-center ml-auto transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-md"
			@click="toggle"
		>
			<Transition
				mode="out-in"
				enter-active-class="transition-opacity duration-150 ease-in-out"
				leave-active-class="transition-opacity duration-150 ease-in-out"
				enter-from-class="opacity-0"
				enter-to-class="opacity-100"
				leave-from-class="opacity-100"
				leave-to-class="opacity-0"
			>
				<template v-if="avatarUrl">
					<img :src="avatarUrl" alt="Chat Avatar" class="w-full h-full rounded-full object-cover" />
				</template>
				<template v-else>
					<IconChat v-if="!isOpen" height="32" width="32" />
					<IconChevronDown v-else height="32" width="32" />
				</template>
			</Transition>
		</div>
	</div>
</template>
