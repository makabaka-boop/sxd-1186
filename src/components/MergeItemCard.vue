<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Layers,
  Undo2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  History,
  User,
  Clock,
} from 'lucide-vue-next';
import type { MergeItem, Feedback, FeedbackStatus, FollowUpRecord } from '../types/feedback';
import { STATUS_LABELS } from '../types/feedback';
import { formatDate, truncateText } from '../utils/helpers';

const props = defineProps<{
  mergeItem: MergeItem;
  feedbacks: Feedback[];
}>();

const emit = defineEmits<{
  undo: [mergeItemId: string];
  updateStatus: [id: string, status: FeedbackStatus];
}>();

const showFollowUps = ref(false);

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

const totalFollowUps = computed(() => {
  return (props.mergeItem.mergedFollowUpRecords || []).length;
});

const sortedFollowUps = computed(() => {
  return [...(props.mergeItem.mergedFollowUpRecords || [])].sort(
    (a, b) => new Date(b.followUpAt).getTime() - new Date(a.followUpAt).getTime()
  );
});

const followUpsBySource = computed(() => {
  const map = new Map<string, FollowUpRecord[]>();
  sortedFollowUps.value.forEach((record) => {
    const key = record.sourceSnackName || '其他';
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(record);
  });
  return Array.from(map.entries());
});

function getFollowUpStatusClass(status: FeedbackStatus): string {
  switch (status) {
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
}

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
        <span class="text-tea-500">{{ feedback.snackName }}</span>
        <span class="text-tea-300">·</span>
        <span class="text-tea-600 truncate flex-1">
          {{ feedback.suggestion || '无建议' }}
        </span>
        <span v-if="feedback.followUpRecords?.length > 0" class="shrink-0 flex items-center gap-0.5 text-tea-400">
          <History class="w-3 h-3" />
          <span>{{ feedback.followUpRecords.length }}</span>
        </span>
      </div>
    </div>

    <!-- 跟进记录来源摘要 -->
    <div v-if="totalFollowUps > 0" class="mb-4">
      <div
        class="flex items-center justify-between mb-2 cursor-pointer py-2 px-3 rounded-lg bg-gradient-to-r from-blue-50/50 to-tea-50/50 border border-blue-100/50 hover:shadow-sm transition-all"
        @click="showFollowUps = !showFollowUps"
      >
        <div class="flex items-center gap-2 text-sm">
          <History class="w-4 h-4 text-blue-500" />
          <span class="font-medium text-tea-700">合并跟进记录</span>
          <span class="tag text-xs border bg-blue-50 text-blue-600 border-blue-200">
            共 {{ totalFollowUps }} 条
          </span>
        </div>
        <div class="flex items-center gap-1 text-xs text-tea-500">
          {{ showFollowUps ? '收起' : '展开查看' }}
          <ChevronDown v-if="!showFollowUps" class="w-4 h-4" />
          <ChevronUp v-else class="w-4 h-4" />
        </div>
      </div>

      <div v-if="showFollowUps" class="space-y-3 mt-3 max-h-72 overflow-y-auto pr-1">
        <div
          v-for="[sourceName, records] in followUpsBySource"
          :key="sourceName"
        >
          <div class="flex items-center gap-1.5 text-xs text-tea-600 font-medium mb-1.5 px-1">
            <Layers class="w-3 h-3 text-tea-400" />
            <span>{{ sourceName }}</span>
            <span class="text-tea-400">({{ records.length }}条)</span>
          </div>
          <div class="space-y-1.5 ml-3">
            <div
              v-for="record in records.slice(0, 3)"
              :key="record.id"
              class="bg-white/60 rounded-lg px-3 py-2 border border-tea-100"
            >
              <div class="flex items-center justify-between gap-2 mb-1">
                <span class="text-xs font-medium text-tea-700 flex items-center gap-1">
                  <User class="w-3 h-3 text-tea-400" />
                  {{ record.handler }}
                </span>
                <span class="tag text-[10px] border" :class="getFollowUpStatusClass(record.status)">
                  {{ STATUS_LABELS[record.status] }}
                </span>
              </div>
              <p class="text-xs text-tea-800">{{ truncateText(record.description, 60) }}</p>
              <p class="text-[10px] text-tea-400 mt-1 flex items-center gap-1">
                <Clock class="w-2.5 h-2.5" />
                {{ formatDate(record.followUpAt) }}
              </p>
            </div>
            <div
              v-if="records.length > 3"
              class="text-xs text-tea-400 pl-1"
            >
              还有 {{ records.length - 3 }} 条记录...
            </div>
          </div>
        </div>
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
