<script setup lang="ts">
import { Filter, X, ChevronDown, ChevronUp, UserCheck, Clock, History } from 'lucide-vue-next';
import type { FilterOptions, Priority, FeedbackStatus, DueStatus, FollowUpStatus } from '../types/feedback';
import { PRIORITY_LABELS, STATUS_LABELS, DUE_STATUS_LABELS, FOLLOW_UP_STATUS_LABELS } from '../types/feedback';

const props = defineProps<{
  filters: FilterOptions;
  snackOptions: string[];
  batchOptions: string[];
  personOptions: string[];
  assigneeOptions?: string[];
  hasActiveFilters: boolean;
}>();

const emit = defineEmits<{
  toggleFilter: [field: keyof FilterOptions, value: string];
  clearAll: [];
}>();

function toggleFilter(field: keyof FilterOptions, value: string) {
  emit('toggleFilter', field, value);
}

function clearAll() {
  emit('clearAll');
}

function isActive(field: keyof FilterOptions, value: string): boolean {
  return props.filters[field].includes(value as never);
}

const dueStatusOptions: DueStatus[] = ['overdue', 'upcoming', 'normal', 'no_due'];
const followUpStatusOptions: FollowUpStatus[] = ['no_followup', 'recent_followup', 'multiple_followups', 'long_no_followup'];
</script>

<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-tea-800 font-serif flex items-center gap-2">
        <Filter class="w-5 h-5 text-tea-500" />
        筛选条件
      </h3>
      <button
        v-if="hasActiveFilters"
        @click="clearAll"
        class="text-xs text-tea-500 hover:text-tea-700 flex items-center gap-1 transition-colors"
      >
        <X class="w-3.5 h-3.5" />
        清除全部
      </button>
    </div>

    <div class="space-y-5">
      <div>
        <h4 class="text-sm font-medium text-tea-700 mb-2">茶点名称</h4>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="snack in snackOptions"
            :key="snack"
            @click="toggleFilter('snackName', snack)"
            class="px-2.5 py-1 text-xs rounded-full border transition-all"
            :class="
              isActive('snackName', snack)
                ? 'bg-tea-500 border-tea-500 text-white'
                : 'bg-white border-tea-200 text-tea-600 hover:border-tea-400 hover:bg-tea-50'
            "
          >
            {{ snack }}
          </button>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-medium text-tea-700 mb-2">批次</h4>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="batch in batchOptions"
            :key="batch"
            @click="toggleFilter('batch', batch)"
            class="px-2.5 py-1 text-xs rounded-full border transition-all"
            :class="
              isActive('batch', batch)
                ? 'bg-tea-500 border-tea-500 text-white'
                : 'bg-white border-tea-200 text-tea-600 hover:border-tea-400 hover:bg-tea-50'
            "
          >
            {{ batch }}
          </button>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-medium text-tea-700 mb-2">重要程度</h4>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="(label, key) in PRIORITY_LABELS"
            :key="key"
            @click="toggleFilter('priority', key)"
            class="px-2.5 py-1 text-xs rounded-full border transition-all"
            :class="
              isActive('priority', key)
                ? key === 'high'
                  ? 'bg-caramel-500 border-caramel-500 text-white'
                  : key === 'medium'
                  ? 'bg-tea-500 border-tea-500 text-white'
                  : 'bg-matcha-500 border-matcha-500 text-white'
                : 'bg-white border-tea-200 text-tea-600 hover:border-tea-400 hover:bg-tea-50'
            "
          >
            {{ label }}
          </button>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-medium text-tea-700 mb-2">处理状态</h4>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="(label, key) in STATUS_LABELS"
            :key="key"
            @click="toggleFilter('status', key)"
            class="px-2.5 py-1 text-xs rounded-full border transition-all"
            :class="
              isActive('status', key)
                ? 'bg-tea-500 border-tea-500 text-white'
                : 'bg-white border-tea-200 text-tea-600 hover:border-tea-400 hover:bg-tea-50'
            "
          >
            {{ label }}
          </button>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-medium text-tea-700 mb-2 flex items-center gap-1.5">
          <UserCheck class="w-3.5 h-3.5 text-tea-400" />
          处理负责人
        </h4>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-if="assigneeOptions && assigneeOptions.length > 0"
            v-for="person in assigneeOptions"
            :key="'assignee-' + person"
            @click="toggleFilter('assignee', person)"
            class="px-2.5 py-1 text-xs rounded-full border transition-all"
            :class="
              isActive('assignee', person)
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-white border-tea-200 text-tea-600 hover:border-tea-400 hover:bg-tea-50'
            "
          >
            {{ person }}
          </button>
          <button
            @click="toggleFilter('assignee', '__unassigned__')"
            class="px-2.5 py-1 text-xs rounded-full border transition-all"
            :class="
              isActive('assignee', '__unassigned__')
                ? 'bg-gray-500 border-gray-500 text-white'
                : 'bg-white border-tea-200 text-tea-500 hover:border-tea-400 hover:bg-tea-50'
            "
          >
            未分配
          </button>
          <div v-if="(!assigneeOptions || assigneeOptions.length === 0)" class="text-xs text-tea-400 py-1">
            暂无负责人数据
          </div>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-medium text-tea-700 mb-2 flex items-center gap-1.5">
          <Clock class="w-3.5 h-3.5 text-tea-400" />
          截止状态
        </h4>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="status in dueStatusOptions"
            :key="status"
            @click="toggleFilter('dueStatus', status)"
            class="px-2.5 py-1 text-xs rounded-full border transition-all"
            :class="[
              isActive('dueStatus', status)
                ? status === 'overdue'
                  ? 'bg-red-500 border-red-500 text-white'
                  : status === 'upcoming'
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : status === 'normal'
                  ? 'bg-matcha-500 border-matcha-500 text-white'
                  : 'bg-gray-500 border-gray-500 text-white'
                : 'bg-white border-tea-200 text-tea-600 hover:border-tea-400 hover:bg-tea-50',
            ]"
          >
            {{ DUE_STATUS_LABELS[status] }}
          </button>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-medium text-tea-700 mb-2 flex items-center gap-1.5">
          <History class="w-3.5 h-3.5 text-tea-400" />
          跟进状态
        </h4>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="status in followUpStatusOptions"
            :key="status"
            @click="toggleFilter('followUpStatus', status)"
            class="px-2.5 py-1 text-xs rounded-full border transition-all"
            :class="[
              isActive('followUpStatus', status)
                ? status === 'long_no_followup'
                  ? 'bg-red-500 border-red-500 text-white'
                  : status === 'no_followup'
                  ? 'bg-gray-500 border-gray-500 text-white'
                  : status === 'recent_followup'
                  ? 'bg-matcha-500 border-matcha-500 text-white'
                  : 'bg-blue-500 border-blue-500 text-white'
                : 'bg-white border-tea-200 text-tea-600 hover:border-tea-400 hover:bg-tea-50',
            ]"
          >
            {{ FOLLOW_UP_STATUS_LABELS[status] }}
          </button>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-medium text-tea-700 mb-2">反馈人</h4>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="person in personOptions"
            :key="'fb-' + person"
            @click="toggleFilter('feedbackPerson', person)"
            class="px-2.5 py-1 text-xs rounded-full border transition-all"
            :class="
              isActive('feedbackPerson', person)
                ? 'bg-tea-500 border-tea-500 text-white'
                : 'bg-white border-tea-200 text-tea-600 hover:border-tea-400 hover:bg-tea-50'
            "
          >
            {{ person }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
