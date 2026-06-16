<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Edit3,
  Trash2,
  User,
  Calendar,
  Star,
  UserCheck,
  AlertCircle,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  History,
  AlertTriangle,
} from 'lucide-vue-next';
import type { Feedback, FeedbackStatus } from '../types/feedback';
import { PRIORITY_LABELS, STATUS_LABELS, SWEETNESS_LABELS } from '../types/feedback';
import { formatDate, formatDateShort, getDueStatus, getDaysSinceFollowUp, getFollowUpStatus, isLongNoFollowUp, truncateText } from '../utils/helpers';

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

const showTimeline = ref(false);

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

const dueInfo = computed(() => {
  const status = getDueStatus(props.feedback.dueDate, props.feedback.status);
  const days = getDaysRemaining(props.feedback.dueDate);
  return { status, days };
});

const dueBadgeClass = computed(() => {
  if (props.feedback.status === 'resolved' || props.feedback.status === 'merged') {
    return 'bg-gray-50 text-gray-400 border-gray-200';
  }
  switch (dueInfo.value.status) {
    case 'overdue':
      return 'bg-red-50 text-red-600 border-red-200';
    case 'upcoming':
      return 'bg-orange-50 text-orange-600 border-orange-200';
    case 'normal':
      return 'bg-matcha-50 text-matcha-600 border-matcha-200';
    default:
      return '';
  }
});

const dueBadgeText = computed(() => {
  if (!props.feedback.dueDate) return '';
  if (props.feedback.status === 'resolved' || props.feedback.status === 'merged') {
    return '已完成';
  }
  const days = dueInfo.value.days;
  if (days === null) return '';
  if (days < 0) return `逾期${Math.abs(days)}天`;
  if (days === 0) return '今日截止';
  if (days === 1) return '明日截止';
  return `剩${days}天`;
});

const sortedFollowUps = computed(() => {
  return [...(props.feedback.followUpRecords || [])].sort(
    (a, b) => new Date(b.followUpAt).getTime() - new Date(a.followUpAt).getTime()
  );
});

const latestFollowUp = computed(() => sortedFollowUps.value[0]);

const followUpCount = computed(() => sortedFollowUps.value.length);

const followUpStatus = computed(() => getFollowUpStatus(props.feedback));

const isLongNoFollowUpFlag = computed(() => isLongNoFollowUp(props.feedback));

const daysSinceFollowUp = computed(() => {
  return getDaysSinceFollowUp(props.feedback.lastFollowUpAt);
});

const followUpBadgeClass = computed(() => {
  if (followUpStatus.value === 'long_no_followup') {
    return 'bg-red-50 text-red-600 border-red-200';
  }
  if (followUpStatus.value === 'multiple_followups') {
    return 'bg-blue-50 text-blue-600 border-blue-200';
  }
  if (followUpStatus.value === 'recent_followup') {
    return 'bg-matcha-50 text-matcha-600 border-matcha-200';
  }
  return 'bg-gray-50 text-gray-500 border-gray-200';
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

function getDaysRemaining(dueDate?: string): number | null {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const dueEndOfDay = new Date(due);
  dueEndOfDay.setHours(23, 59, 59, 999);
  const diffMs = dueEndOfDay.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function handleEdit() {
  emit('edit', props.feedback);
}

function handleDelete() {
  emit('delete', props.feedback.id);
}

function handleSelect() {
  emit('select', props.feedback.id, !props.selected);
}

function toggleTimeline() {
  showTimeline.value = !showTimeline.value;
}
</script>

<template>
  <div
    class="card relative overflow-hidden transition-all duration-300 animate-fade-in-up"
    :class="{
      'ring-2 ring-tea-500 ring-offset-2': selected,
      'opacity-60': feedback.status === 'merged',
      'ring-2 ring-red-400/30': isLongNoFollowUpFlag,
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
      <span
        v-if="feedback.dueDate && dueBadgeClass"
        class="tag border flex items-center gap-1"
        :class="dueBadgeClass"
      >
        <Clock v-if="dueInfo.status === 'upcoming' && feedback.status !== 'resolved' && feedback.status !== 'merged'" class="w-3 h-3" />
        <AlertCircle v-else-if="dueInfo.status === 'overdue' && feedback.status !== 'resolved' && feedback.status !== 'merged'" class="w-3 h-3" />
        {{ dueBadgeText }}
      </span>
      <span
        v-if="followUpCount > 0"
        class="tag border flex items-center gap-1"
        :class="followUpBadgeClass"
      >
        <History class="w-3 h-3" />
        {{ followUpCount }}次跟进
      </span>
      <span
        v-else-if="isLongNoFollowUpFlag"
        class="tag border flex items-center gap-1 bg-red-50 text-red-600 border-red-200 animate-pulse"
      >
        <AlertTriangle class="w-3 h-3" />
        长时间未跟进
      </span>
    </div>

    <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
      <div
        v-if="feedback.assignee"
        class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-tea-50/60 border border-tea-100"
      >
        <UserCheck class="w-3.5 h-3.5 text-tea-500 flex-shrink-0" />
        <span class="text-tea-700 truncate">{{ feedback.assignee }}</span>
      </div>
      <div
        v-else
        class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-100"
      >
        <UserCheck class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span class="text-gray-400">待分配</span>
      </div>
      <div
        v-if="feedback.dueDate"
        class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border"
        :class="[
          dueInfo.status === 'overdue' && feedback.status !== 'resolved' && feedback.status !== 'merged'
            ? 'bg-red-50/50 border-red-100'
            : dueInfo.status === 'upcoming' && feedback.status !== 'resolved' && feedback.status !== 'merged'
            ? 'bg-orange-50/50 border-orange-100'
            : 'bg-blue-50/50 border-blue-100',
        ]"
      >
        <Calendar
          class="w-3.5 h-3.5 flex-shrink-0"
          :class="[
            dueInfo.status === 'overdue' && feedback.status !== 'resolved' && feedback.status !== 'merged'
              ? 'text-red-500'
              : dueInfo.status === 'upcoming' && feedback.status !== 'resolved' && feedback.status !== 'merged'
              ? 'text-orange-500'
              : 'text-blue-500',
          ]"
        />
        <span
          class="truncate"
          :class="[
            dueInfo.status === 'overdue' && feedback.status !== 'resolved' && feedback.status !== 'merged'
              ? 'text-red-600'
              : dueInfo.status === 'upcoming' && feedback.status !== 'resolved' && feedback.status !== 'merged'
              ? 'text-orange-600'
              : 'text-blue-700',
          ]"
        >
          {{ formatDateShort(feedback.dueDate) }}
        </span>
      </div>
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

    <div
      v-if="feedback.handleNote"
      class="mb-3"
    >
      <p class="text-sm text-tea-600 mb-1 flex items-center gap-1">
        <FileText class="w-3.5 h-3.5" />
        处理备注
      </p>
      <p class="text-sm text-tea-700 bg-gradient-to-r from-blue-50/80 to-tea-50/80 rounded-lg p-3 border border-blue-100/50">
        {{ feedback.handleNote }}
      </p>
    </div>

    <!-- 最近跟进摘要 -->
    <div
      v-if="latestFollowUp"
      class="mb-3"
    >
      <div
        class="flex items-center justify-between mb-1.5"
      >
        <p class="text-sm text-tea-600 flex items-center gap-1 cursor-pointer hover:text-tea-800"
          @click="toggleTimeline"
        >
          <MessageSquare class="w-3.5 h-3.5" />
          <span class="font-medium">最近跟进</span>
          <span class="text-tea-400">·</span>
          <span class="text-tea-500">{{ latestFollowUp.handler }}</span>
        </p>
        <button
          v-if="followUpCount > 1"
          @click="toggleTimeline"
          class="text-xs text-tea-500 hover:text-tea-700 flex items-center gap-0.5 transition-colors"
        >
          {{ showTimeline ? '收起' : '查看全部' }} ({{ followUpCount }})
          <ChevronDown v-if="!showTimeline" class="w-3.5 h-3.5" />
          <ChevronUp v-else class="w-3.5 h-3.5" />
        </button>
      </div>
      <div class="text-sm text-tea-800 bg-gradient-to-r from-tea-50 to-blue-50 rounded-lg p-3 border border-tea-100">
        <div class="flex items-start justify-between gap-2">
          <p class="flex-1">{{ truncateText(latestFollowUp.description, 80) }}</p>
          <span class="tag text-[10px] border shrink-0" :class="getFollowUpStatusClass(latestFollowUp.status)">
            {{ STATUS_LABELS[latestFollowUp.status] }}
          </span>
        </div>
        <p class="text-xs text-tea-400 mt-1.5 flex items-center gap-1">
          <Clock class="w-3 h-3" />
          {{ formatDate(latestFollowUp.followUpAt) }}
          <template v-if="daysSinceFollowUp !== null">
            <span class="text-tea-300">·</span>
            <span>{{ daysSinceFollowUp === 0 ? '今天' : daysSinceFollowUp + '天前' }}</span>
          </template>
        </p>
      </div>
    </div>

    <!-- 时间线展开 -->
    <div v-if="showTimeline && followUpCount > 0" class="mb-3">
      <div class="space-y-2.5 mt-3 pt-3 border-t border-tea-100">
        <div
          v-for="(record, index) in sortedFollowUps"
          :key="record.id"
          class="relative pl-6"
        >
          <div
            class="absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full bg-tea-500 border-2 border-white shadow-sm"
            :class="{ 'bg-tea-300': index > 0 }"
          ></div>
          <div
            v-if="index < sortedFollowUps.length - 1"
            class="absolute left-[9px] top-4 bottom-[-8px] w-0.5 bg-tea-200"
          ></div>
          <div class="bg-white/70 rounded-lg p-2.5 border border-tea-100">
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-xs font-medium text-tea-700 flex items-center gap-1">
                <User class="w-3 h-3 text-tea-400" />
                {{ record.handler }}
              </span>
              <span class="tag text-[10px] border" :class="getFollowUpStatusClass(record.status)">
                {{ STATUS_LABELS[record.status] }}
              </span>
            </div>
            <p class="text-xs text-tea-800 mb-1">{{ record.description }}</p>
            <p class="text-[10px] text-tea-400 flex items-center gap-1">
              <Clock class="w-2.5 h-2.5" />
              {{ formatDate(record.followUpAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="!latestFollowUp && feedback.lastFollowUpAt"
      class="mb-3 flex items-center gap-1 text-xs text-tea-400"
    >
      <Clock class="w-3 h-3" />
      <span>最后跟进：{{ formatDate(feedback.lastFollowUpAt) }}</span>
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
