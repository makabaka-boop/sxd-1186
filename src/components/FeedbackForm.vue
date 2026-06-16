<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import {
  X,
  Plus,
  UserCheck,
  CalendarDays,
  FileText,
  Clock,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  User,
  Trash2,
} from 'lucide-vue-next';
import type { Feedback, Priority, FeedbackStatus, FollowUpRecord } from '../types/feedback';
import { PRIORITY_LABELS, STATUS_LABELS, SWEETNESS_LABELS } from '../types/feedback';
import {
  toDateInputValue,
  formatDate,
  toDateTimeInputValues,
  fromDateTimeInputValues,
  generateId,
} from '../utils/helpers';

const props = defineProps<{
  visible: boolean;
  feedback?: Feedback | null;
  snackOptions: string[];
  batchOptions: string[];
  personOptions: string[];
}>();

const emit = defineEmits<{
  close: [];
  submit: [
    data: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'> & {
      status?: FeedbackStatus;
      newFollowUp?: Omit<FollowUpRecord, 'id'> | null;
    }
  ];
}>();

const form = ref({
  snackName: '',
  batch: '',
  sweetness: 3,
  textureKeywords: [] as string[],
  suggestion: '',
  feedbackPerson: '',
  priority: 'medium' as Priority,
  status: 'pending' as FeedbackStatus,
  assignee: '',
  dueDate: '',
  handleNote: '',
  lastFollowUpAt: '',
  followUpRecords: [] as FollowUpRecord[],
});

const keywordInput = ref('');
const dueDateInput = ref('');
const followUpDateInput = ref('');
const followUpTimeInput = ref('');
const isFormLoaded = ref(false);
const showTimeline = ref(false);

const newFollowUp = ref({
  description: '',
  handler: '',
  followUpAt: '',
  dateInput: '',
  timeInput: '',
  status: 'pending' as FeedbackStatus,
});

const isEdit = computed(() => !!props.feedback);
const title = computed(() => (isEdit.value ? '编辑反馈' : '新增反馈'));
const sortedFollowUps = computed(() => {
  return [...form.value.followUpRecords].sort(
    (a, b) => new Date(b.followUpAt).getTime() - new Date(a.followUpAt).getTime()
  );
});

const predefinedKeywords = [
  '酥脆', '软糯', '香甜', '清香', '细腻', '香浓',
  '偏硬', '偏甜', '太淡', '层次分明', '酥软', '清爽',
];

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      isFormLoaded.value = false;
      if (props.feedback) {
        form.value = {
          snackName: props.feedback.snackName,
          batch: props.feedback.batch,
          sweetness: props.feedback.sweetness,
          textureKeywords: [...props.feedback.textureKeywords],
          suggestion: props.feedback.suggestion,
          feedbackPerson: props.feedback.feedbackPerson,
          priority: props.feedback.priority,
          status: props.feedback.status,
          assignee: props.feedback.assignee || '',
          dueDate: props.feedback.dueDate || '',
          handleNote: props.feedback.handleNote || '',
          lastFollowUpAt: props.feedback.lastFollowUpAt || '',
          followUpRecords: [...(props.feedback.followUpRecords || [])],
        };
        dueDateInput.value = toDateInputValue(props.feedback.dueDate);
        const { date, time } = toDateTimeInputValues(props.feedback.lastFollowUpAt);
        followUpDateInput.value = date;
        followUpTimeInput.value = time;
      } else {
        form.value = {
          snackName: '',
          batch: '',
          sweetness: 3,
          textureKeywords: [],
          suggestion: '',
          feedbackPerson: '',
          priority: 'medium',
          status: 'pending',
          assignee: '',
          dueDate: '',
          handleNote: '',
          lastFollowUpAt: '',
          followUpRecords: [],
        };
        dueDateInput.value = '';
        followUpDateInput.value = '';
        followUpTimeInput.value = '';
      }
      keywordInput.value = '';
      resetNewFollowUp();
      showTimeline.value = false;
      await nextTick();
      isFormLoaded.value = true;
    }
  }
);

function resetNewFollowUp() {
  const now = new Date();
  const { date, time } = toDateTimeInputValues(now.toISOString());
  newFollowUp.value = {
    description: '',
    handler: form.value.assignee || '',
    followUpAt: now.toISOString(),
    dateInput: date,
    timeInput: time,
    status: form.value.status,
  };
}

watch(dueDateInput, (val) => {
  if (val) {
    const d = new Date(val);
    d.setHours(18, 0, 0, 0);
    form.value.dueDate = d.toISOString();
  } else {
    form.value.dueDate = '';
  }
});

watch(
  [followUpDateInput, followUpTimeInput],
  ([dateVal, timeVal]) => {
    if (dateVal) {
      form.value.lastFollowUpAt = fromDateTimeInputValues(dateVal, timeVal);
    } else {
      form.value.lastFollowUpAt = '';
    }
  }
);

watch(
  [() => newFollowUp.value.dateInput, () => newFollowUp.value.timeInput],
  ([dateVal, timeVal]) => {
    if (dateVal) {
      newFollowUp.value.followUpAt = fromDateTimeInputValues(dateVal, timeVal);
    }
  }
);

function touchFollowUpTime() {
  if (!isFormLoaded.value) return;
  const now = new Date();
  form.value.lastFollowUpAt = now.toISOString();
  const { date, time } = toDateTimeInputValues(now.toISOString());
  followUpDateInput.value = date;
  followUpTimeInput.value = time;
}

watch(
  () => [form.value.assignee, form.value.dueDate, form.value.handleNote, form.value.status],
  () => {
    if (isFormLoaded.value) {
      touchFollowUpTime();
    }
  },
  { deep: false }
);

function setFollowUpToNow() {
  touchFollowUpTime();
}

function setNewFollowUpToNow() {
  const now = new Date();
  const { date, time } = toDateTimeInputValues(now.toISOString());
  newFollowUp.value.dateInput = date;
  newFollowUp.value.timeInput = time;
  newFollowUp.value.followUpAt = now.toISOString();
}

function addKeyword(keyword: string) {
  if (keyword && !form.value.textureKeywords.includes(keyword)) {
    form.value.textureKeywords.push(keyword);
  }
  keywordInput.value = '';
}

function removeKeyword(keyword: string) {
  const index = form.value.textureKeywords.indexOf(keyword);
  if (index !== -1) {
    form.value.textureKeywords.splice(index, 1);
  }
}

function handleKeywordKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && keywordInput.value.trim()) {
    e.preventDefault();
    addKeyword(keywordInput.value.trim());
  }
}

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

function handleSubmit() {
  if (!form.value.snackName.trim()) {
    alert('请填写茶点名称');
    return;
  }
  if (!form.value.batch.trim()) {
    alert('请填写批次');
    return;
  }
  if (!form.value.feedbackPerson.trim()) {
    alert('请填写反馈人');
    return;
  }

  let newFollowUpData: Omit<FollowUpRecord, 'id'> | null = null;
  if (isEdit.value && newFollowUp.value.description.trim()) {
    if (!newFollowUp.value.handler.trim()) {
      alert('请填写跟进处理人');
      return;
    }
    newFollowUpData = {
      description: newFollowUp.value.description.trim(),
      handler: newFollowUp.value.handler.trim(),
      followUpAt: newFollowUp.value.followUpAt || new Date().toISOString(),
      status: newFollowUp.value.status,
    };
    form.value.status = newFollowUp.value.status;
  }

  const submitData = { ...form.value };
  emit('submit', { ...submitData, newFollowUp: newFollowUpData });
}

function handleClose() {
  emit('close');
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="handleClose"
    >
      <div class="absolute inset-0 bg-tea-900/40 backdrop-blur-sm"></div>

      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
        <div class="flex items-center justify-between px-6 py-4 border-b border-tea-100 bg-gradient-to-r from-tea-50 to-transparent">
          <h2 class="text-xl font-semibold text-tea-800 font-serif">{{ title }}</h2>
          <button
            @click="handleClose"
            class="p-1.5 rounded-lg text-tea-400 hover:bg-tea-100 hover:text-tea-600 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="px-6 py-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-tea-700 mb-1.5">茶点名称 *</label>
                <input
                  v-model="form.snackName"
                  type="text"
                  list="snack-list"
                  class="input-field"
                  placeholder="如：抹茶曲奇"
                />
                <datalist id="snack-list">
                  <option v-for="snack in snackOptions" :key="snack" :value="snack">
                    {{ snack }}
                  </option>
                </datalist>
              </div>
              <div>
                <label class="block text-sm font-medium text-tea-700 mb-1.5">批次 *</label>
                <input
                  v-model="form.batch"
                  type="text"
                  list="batch-list"
                  class="input-field"
                  placeholder="如：B20240601"
                />
                <datalist id="batch-list">
                  <option v-for="batch in batchOptions" :key="batch" :value="batch">
                    {{ batch }}
                  </option>
                </datalist>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-tea-700 mb-1.5">反馈人 *</label>
              <input
                v-model="form.feedbackPerson"
                type="text"
                list="person-list"
                class="input-field"
                placeholder="请输入反馈人姓名"
              />
              <datalist id="person-list">
                <option v-for="person in personOptions" :key="person" :value="person">
                  {{ person }}
                </option>
              </datalist>
            </div>

            <div>
              <label class="block text-sm font-medium text-tea-700 mb-2">
                甜度评价：<span class="font-semibold text-tea-600">{{ SWEETNESS_LABELS[form.sweetness] }}</span>
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model="form.sweetness"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  class="flex-1 h-2 bg-tea-100 rounded-lg appearance-none cursor-pointer accent-tea-500"
                />
                <span class="w-8 text-center text-sm font-medium text-tea-600">{{ form.sweetness }}</span>
              </div>
              <div class="flex justify-between text-xs text-tea-400 mt-1">
                <span>太淡</span>
                <span>适中</span>
                <span>太甜</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-tea-700 mb-1.5">口感关键词</label>
              <div class="flex flex-wrap gap-1.5 mb-2">
                <span
                  v-for="keyword in form.textureKeywords"
                  :key="keyword"
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-sm rounded-full bg-tea-100 text-tea-700"
                >
                  {{ keyword }}
                  <button
                    @click="removeKeyword(keyword)"
                    class="text-tea-400 hover:text-tea-600"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>
              <div class="flex gap-2">
                <input
                  v-model="keywordInput"
                  type="text"
                  class="input-field flex-1"
                  placeholder="输入关键词后回车添加"
                  @keydown="handleKeywordKeydown"
                />
                <button
                  @click="addKeyword(keywordInput.trim())"
                  class="btn-secondary flex items-center gap-1"
                  :disabled="!keywordInput.trim()"
                >
                  <Plus class="w-4 h-4" />
                  添加
                </button>
              </div>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <span class="text-xs text-tea-400 mr-1">快捷标签：</span>
                <button
                  v-for="keyword in predefinedKeywords"
                  :key="keyword"
                  @click="addKeyword(keyword)"
                  class="px-2 py-0.5 text-xs rounded-full border border-tea-200 text-tea-500 hover:bg-tea-50 hover:border-tea-300 transition-colors"
                  :class="{ 'opacity-40 cursor-not-allowed': form.textureKeywords.includes(keyword) }"
                  :disabled="form.textureKeywords.includes(keyword)"
                >
                  + {{ keyword }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-tea-700 mb-1.5">改进建议</label>
              <textarea
                v-model="form.suggestion"
                class="input-field min-h-[80px] resize-y"
                placeholder="请描述具体的改进建议..."
              ></textarea>
            </div>

            <div class="pt-4 border-t border-tea-100">
              <h4 class="text-sm font-semibold text-tea-800 mb-4 flex items-center gap-2">
                <FileText class="w-4 h-4 text-tea-500" />
                处理跟进信息
              </h4>

              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-tea-700 mb-1.5 flex items-center gap-1.5">
                      <UserCheck class="w-4 h-4 text-tea-400" />
                      处理负责人
                    </label>
                    <input
                      v-model="form.assignee"
                      type="text"
                      list="assignee-list"
                      class="input-field"
                      placeholder="请输入处理负责人姓名"
                    />
                    <datalist id="assignee-list">
                      <option v-for="person in personOptions" :key="'a-' + person" :value="person">
                        {{ person }}
                      </option>
                      <option value="李研发">李研发</option>
                      <option value="王品控">王品控</option>
                      <option value="张配方师">张配方师</option>
                      <option value="陈主管">陈主管</option>
                    </datalist>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-tea-700 mb-1.5 flex items-center gap-1.5">
                      <CalendarDays class="w-4 h-4 text-tea-400" />
                      预计完成时间
                    </label>
                    <input
                      v-model="dueDateInput"
                      type="date"
                      class="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-tea-700 mb-1.5 flex items-center gap-1.5">
                    <Clock class="w-4 h-4 text-tea-400" />
                    最后跟进时间
                    <button
                      type="button"
                      @click="setFollowUpToNow"
                      class="ml-auto text-xs text-tea-500 hover:text-tea-700 flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw class="w-3 h-3" />
                      更新为现在
                    </button>
                  </label>
                  <div class="flex gap-2">
                    <input
                      v-model="followUpDateInput"
                      type="date"
                      class="input-field flex-1"
                    />
                    <input
                      v-model="followUpTimeInput"
                      type="time"
                      class="input-field w-28"
                    />
                  </div>
                  <p class="text-xs text-tea-400 mt-1">
                    修改负责人、截止时间、备注或状态时会自动更新
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-tea-700 mb-1.5">处理备注</label>
                  <textarea
                    v-model="form.handleNote"
                    class="input-field min-h-[70px] resize-y"
                    placeholder="记录处理进展、沟通情况等..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div v-if="isEdit" class="pt-4 border-t border-tea-100">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-semibold text-tea-800 flex items-center gap-2">
                  <MessageSquare class="w-4 h-4 text-tea-500" />
                  新增跟进记录
                </h4>
                <button
                  v-if="sortedFollowUps.length > 0"
                  type="button"
                  @click="showTimeline = !showTimeline"
                  class="text-xs text-tea-500 hover:text-tea-700 flex items-center gap-1 transition-colors"
                >
                  {{ showTimeline ? '收起' : '查看历史' }} ({{ sortedFollowUps.length }})
                  <ChevronDown v-if="!showTimeline" class="w-3.5 h-3.5" />
                  <ChevronUp v-else class="w-3.5 h-3.5" />
                </button>
              </div>

              <div v-if="showTimeline && sortedFollowUps.length > 0" class="mb-5">
                <div class="space-y-3 max-h-64 overflow-y-auto pr-2 bg-tea-50/50 rounded-xl p-4 border border-tea-100">
                  <div
                    v-for="(record, index) in sortedFollowUps"
                    :key="record.id"
                    class="relative pl-6"
                  >
                    <div
                      class="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-tea-500 border-2 border-white shadow"
                    ></div>
                    <div
                      v-if="index < sortedFollowUps.length - 1"
                      class="absolute left-[5px] top-5 bottom-[-12px] w-0.5 bg-tea-200"
                    ></div>
                    <div class="bg-white rounded-lg p-3 border border-tea-100 shadow-sm">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                          <User class="w-3.5 h-3.5 text-tea-500" />
                          <span class="text-sm font-medium text-tea-700">{{ record.handler }}</span>
                        </div>
                        <span class="tag text-xs border" :class="getFollowUpStatusClass(record.status)">
                          {{ STATUS_LABELS[record.status] }}
                        </span>
                      </div>
                      <p class="text-sm text-tea-800 mb-2">{{ record.description }}</p>
                      <p class="text-xs text-tea-400 flex items-center gap-1">
                        <Clock class="w-3 h-3" />
                        {{ formatDate(record.followUpAt) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-3 bg-gradient-to-br from-tea-50/50 to-blue-50/30 rounded-xl p-4 border border-tea-100">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-tea-700 mb-1.5 flex items-center gap-1.5">
                      <UserCheck class="w-3.5 h-3.5 text-tea-400" />
                      处理人
                    </label>
                    <input
                      v-model="newFollowUp.handler"
                      type="text"
                      list="handler-list"
                      class="input-field !py-2 !text-sm"
                      placeholder="请输入处理人"
                    />
                    <datalist id="handler-list">
                      <option value="李研发">李研发</option>
                      <option value="王品控">王品控</option>
                      <option value="张配方师">张配方师</option>
                      <option value="陈主管">陈主管</option>
                    </datalist>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-tea-700 mb-1.5">处理状态</label>
                    <select
                      v-model="newFollowUp.status"
                      class="input-field !py-2 !text-sm"
                    >
                      <option value="pending">待处理</option>
                      <option value="processing">处理中</option>
                      <option value="resolved">已解决</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-tea-700 mb-1.5 flex items-center gap-1.5">
                    <Clock class="w-3.5 h-3.5 text-tea-400" />
                    跟进时间
                    <button
                      type="button"
                      @click="setNewFollowUpToNow"
                      class="ml-auto text-xs text-tea-500 hover:text-tea-700 flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw class="w-3 h-3" />
                      现在
                    </button>
                  </label>
                  <div class="flex gap-2">
                    <input
                      v-model="newFollowUp.dateInput"
                      type="date"
                      class="input-field !py-2 !text-sm flex-1"
                    />
                    <input
                      v-model="newFollowUp.timeInput"
                      type="time"
                      class="input-field !py-2 !text-sm w-28"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-tea-700 mb-1.5">跟进说明 *</label>
                  <textarea
                    v-model="newFollowUp.description"
                    class="input-field min-h-[80px] resize-y !text-sm"
                    placeholder="请填写本次跟进的具体内容、进展或结论...（填写后将自动添加一条跟进记录）"
                  ></textarea>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-tea-700 mb-2">重要程度</label>
              <div class="flex gap-3">
                <button
                  v-for="(label, key) in PRIORITY_LABELS"
                  :key="key"
                  @click="form.priority = key as Priority"
                  class="flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all"
                  :class="[
                    form.priority === key
                      ? key === 'high'
                        ? 'border-caramel-400 bg-caramel-50 text-caramel-700'
                        : key === 'medium'
                        ? 'border-tea-400 bg-tea-50 text-tea-700'
                        : 'border-matcha-400 bg-matcha-50 text-matcha-700'
                      : 'border-tea-100 bg-white text-tea-400 hover:border-tea-200',
                  ]"
                >
                  {{ label }}
                </button>
              </div>
            </div>

            <div v-if="!isEdit || feedback?.status !== 'merged'">
              <label class="block text-sm font-medium text-tea-700 mb-2">处理状态</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(label, key) in STATUS_LABELS"
                  :key="key"
                  @click="form.status = key as FeedbackStatus"
                  class="px-4 py-2 rounded-lg border-2 font-medium transition-all text-sm"
                  :class="[
                    form.status === key
                      ? key === 'pending'
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : key === 'processing'
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : key === 'resolved'
                        ? 'border-matcha-400 bg-matcha-50 text-matcha-700'
                        : 'border-gray-400 bg-gray-50 text-gray-700'
                      : 'border-tea-100 bg-white text-tea-400 hover:border-tea-200',
                  ]"
                  :disabled="key === 'merged'"
                >
                  {{ label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-tea-100 bg-tea-50/50">
          <button @click="handleClose" class="btn-secondary">取消</button>
          <button @click="handleSubmit" class="btn-primary">
            {{ isEdit ? '保存修改' : '提交反馈' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
