<script setup lang="ts">
import { computed } from 'vue';
import {
  Edit3,
  Trash2,
  User,
  Calendar,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-vue-next';
import type { Feedback } from '../types/feedback';
import { PRIORITY_LABELS, STATUS_LABELS, SWEETNESS_LABELS } from '../types/feedback';
import { formatDate } from '../utils/helpers';

const props = defineProps<{
  feedback: Feedback;
  selected?: boolean;
  selectable?: boolean;
  showActions?: boolean;
}>();

const emit = defineEmits<{
  edit: [feedback: Feedback];
  delete: [id: string];
  select: [id: string, selected: boolean];
}>();

const priorityClass = computed(() => {
  switch (props.feedback.priority) {
    case 'high':
      return 'bg-caramel-100 text-caramel-700 border-caramel-200';
    case 'medium':
      return 'bg-tea-100 text-tea-700 border-tea-200';
    case 'low':
      return 'bg-matcha-100 text-matcha-700 border-matcha-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
});

const statusClass = computed(() => {
  switch (props.feedback.status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'processing':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'resolved':
      return 'bg-matcha-50 text-matcha-700 border-matcha-200';
    case 'merged':
      return 'bg-gray-50 text-gray-500 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
});

const sweetnessStars = computed(() => {
  return Array.from({ length: 5 }, (_, i) => i < props.feedback.sweetness);
});

const sweetnessColor = computed(() => {
  if (props.feedback.sweetness <= 2) return 'text-caramel-500';
  if (props.feedback.sweetness >= 4) return 'text-amber-500';
  return 'text-tea-500';
});

function handleEdit() {
  emit('edit', props.feedback);
}

function handleDelete() {
  emit('delete', props.feedback.id);
}

function handleSelect() {
  emit('select', props.feedback.id, !props.selected);
}
</script>

<template>
  <div
    class="card relative overflow-hidden transition-all duration-300 animate-fade-in-up"
    :class="{
      'ring-2 ring-tea-500 ring-offset-2': selected,
      'opacity-60': feedback.status === 'merged',
    }"
  >
    <div class="absolute top-0 left-0 w-1 h-full" :class="priorityClass.replace('bg-', 'bg-').split(' ')[0]"></div>

    <div v-if="selectable" class="absolute top-3 right-3 z-10">
      <button
        @click="handleSelect"
        class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
        :class="selected ? 'bg-tea-500 border-tea-500 text-white' : 'border-tea-300 hover:border-tea-500'"
      >
        <svg v-if="selected" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <div class="flex items-start justify-between mb-3 pr-8">
      <div>
        <h3 class="text-lg font-semibold text-tea-800 font-serif">{{ feedback.snackName }}</h3>
        <p class="text-sm text-tea-500">批次：{{ feedback.batch }}</p>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mb-3">
      <span class="tag border" :class="priorityClass">
        {{ PRIORITY_LABELS[feedback.priority] }}优先级
      </span>
      <span class="tag border" :class="statusClass">
        {{ STATUS_LABELS[feedback.status] }}
      </span>
    </div>

    <div class="mb-3">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-sm text-tea-600">甜度评价</span>
        <span class="text-sm font-medium" :class="sweetnessColor">{{ SWEETNESS_LABELS[feedback.sweetness] }}</span>
      </div>
      <div class="flex gap-0.5">
        <Star
          v-for="(filled, index) in sweetnessStars"
          :key="index"
          class="w-4 h-4"
          :class="filled ? sweetnessColor + ' fill-current' : 'text-tea-200'"
        />
      </div>
    </div>

    <div class="mb-3" v-if="feedback.textureKeywords.length > 0">
      <p class="text-sm text-tea-600 mb-1">口感关键词</p>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="keyword in feedback.textureKeywords"
          :key="keyword"
          class="px-2 py-0.5 text-xs rounded-full bg-tea-50 text-tea-600 border border-tea-100"
        >
          {{ keyword }}
        </span>
      </div>
    </div>

    <div class="mb-3" v-if="feedback.suggestion">
      <p class="text-sm text-tea-600 mb-1">改进建议</p>
      <p class="text-sm text-tea-800 bg-tea-50 rounded-lg p-3 border border-tea-100">
        {{ feedback.suggestion }}
      </p>
    </div>

    <div class="flex items-center justify-between pt-3 border-t border-tea-100">
      <div class="flex items-center gap-4 text-xs text-tea-500">
        <span class="flex items-center gap-1">
          <User class="w-3.5 h-3.5" />
          {{ feedback.feedbackPerson }}
        </span>
        <span class="flex items-center gap-1">
          <Calendar class="w-3.5 h-3.5" />
          {{ formatDate(feedback.createdAt) }}
        </span>
      </div>

      <div v-if="showActions && feedback.status !== 'merged'" class="flex items-center gap-1">
        <button
          @click="handleEdit"
          class="p-1.5 rounded-lg text-tea-500 hover:bg-tea-50 hover:text-tea-700 transition-colors"
          title="编辑"
        >
          <Edit3 class="w-4 h-4" />
        </button>
        <button
          @click="handleDelete"
          class="p-1.5 rounded-lg text-caramel-400 hover:bg-caramel-50 hover:text-caramel-600 transition-colors"
          title="删除"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
