<script setup lang="ts">
import IconDelete from 'virtual:icons/mdi/closeThick';
import IconFileImage from 'virtual:icons/mdi/fileImage';
import IconFileMusic from 'virtual:icons/mdi/fileMusic';
import IconFileText from 'virtual:icons/mdi/fileText';
import IconFileVideo from 'virtual:icons/mdi/fileVideo';
import IconPreview from 'virtual:icons/mdi/openInNew';
import { computed, type FunctionalComponent } from 'vue';

const props = defineProps<{
	file: File;
	isRemovable: boolean;
	isPreviewable?: boolean;
}>();

const emit = defineEmits<{
	remove: [value: File];
}>();

const iconMapper: Record<string, FunctionalComponent> = {
	document: IconFileText,
	audio: IconFileMusic,
	image: IconFileImage,
	video: IconFileVideo,
};

const TypeIcon = computed(() => {
	const type = props.file?.type.split('/')[0];
	return iconMapper[type] || IconFileText;
});

function onClick() {
	if (props.isPreviewable) {
		window.open(URL.createObjectURL(props.file));
	}
}
function onDelete() {
	emit('remove', props.file);
}
</script>

<template>
	<div class="chat-file" @click="onClick">
		<TypeIcon />
		<p class="chat-file-name">{{ file.name }}</p>
		<span v-if="isRemovable" class="chat-file-delete" @click.stop="onDelete">
			<IconDelete />
		</span>
		<IconPreview v-else-if="isPreviewable" class="chat-file-preview" />
	</div>
</template>

<style scoped>
.chat-file {
	@apply flex items-center flex-nowrap w-fit max-w-[15rem] p-2 rounded gap-1 text-xs;
	@apply bg-white text-gray-900 border border-gray-900 cursor-pointer;
}

.chat-file-name-tooltip {
	@apply overflow-hidden;
}

.chat-file-name {
	@apply overflow-hidden max-w-full text-ellipsis whitespace-nowrap m-0;
}

.chat-file-delete,
.chat-file-preview {
	@apply bg-transparent border-none block cursor-pointer flex-shrink-0;
}

.chat-file-delete {
	@apply relative hover:text-red-500;
}

/* Increase hit area for better clickability */
.chat-file-delete:before {
	content: '';
	@apply absolute -inset-[10px];
}
</style>
