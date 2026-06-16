<script setup lang="ts">
import { computed } from 'vue';
import { Layers, Undo2, ChevronDown, ChevronUp, CheckCircle } from 'lucide-vue-next';
import type { MergeItem, Feedback, FeedbackStatus } from '../types/feedback';
import { STATUS_LABELS } from '../types/feedback';
import { formatDate } from '../utils/helpers';

const props = defineProps<{
  mergeItem: MergeItem;
  feedbacks: Feedback[];
}>();

const emit = defineEmits<{
  undo: [mergeItemId: string];
  updateStatus: [id: string, status: FeedbackStatus];
}>();

const statusClass = computed(() => {
  switch (props.mergeItem.status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'processing':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'resolved':
      return 'bg-matcha-50 text-matcha-700 border-matcha-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
});

function handleUndo() {
  if (confirm('确定要撤回合并吗？撤回后所有反馈将恢复为待处理状态。')) {
    emit('undo', props.mergeItem.id);
  }
}

function toggleStatus() {
  const nextStatus: FeedbackStatus = props.mergeItem.status === 'resolved' ? 'processing' : 'resolved';
  emit('updateStatus', props.mergeItem.id, nextStatus);
}
</script>

<template>
  <div class="card bg-gradient-to-br from-tea-50 to-white border-tea-100">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-lg bg-tea-100 flex items-center justify-center flex-shrink-0">
          <Layers class="w-5 h-5 text-tea-600" />
        </div>
        <div>
          <h3 class="font-semibold text-tea-800">{{ mergeItem.title }}</h3>
          <p class="text-xs text-tea-500 mt-0.5">
            包含 {{ mergeItem.feedbackIds.length }} 条反馈 · {{ formatDate(mergeItem.createdAt) }}
          </p>
        </div>
      </div>
      <span class="tag border" :class="statusClass">
        {{ STATUS_LABELS[mergeItem.status] }}
      </span>
    </div>

    <div class="space-y-1.5 mb-4 max-h-32 overflow-y-auto">
      <div
        v-for="feedback in feedbacks"
        :key="feedback.id"
        class="flex items-center gap-2 text-xs bg-white/70 rounded-lg px-3 py-2 border border-tea-100"
      >
        <span class="text-tea-700 font-medium">{{ feedback.feedbackPerson }}</span>
        <span class="text-tea-300">·</span>
        <span class="text-tea-600 truncate flex-1">
          {{ feedback.suggestion || '无建议' }}
        </span>
      </div>
    </div>

    <div class="flex items-center justify-between pt-3 border-t border-tea-100">
      <button
        @click="handleUndo"
        class="text-xs text-tea-500 hover:text-tea-700 flex items-center gap-1 transition-colors"
      >
        <Undo2 class="w-3.5 h-3.5" />
        撤回合并
      </button>
      <button
        @click="toggleStatus"
        class="text-xs flex items-center gap-1 transition-colors"
        :class="mergeItem.status === 'resolved' ? 'text-caramel-500 hover:text-caramel-700' : 'text-matcha-500 hover:text-matcha-700'"
      >
        <CheckCircle class="w-3.5 h-3.5" />
        {{ mergeItem.status === 'resolved' ? '标记为未解决' : '标记为已解决' }}
      </button>
    </div>
  </div>
</template>
