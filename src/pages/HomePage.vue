<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Plus,
  Download,
  Merge,
  Cookie,
  LayoutGrid,
} from 'lucide-vue-next';
import FeedbackCard from '../components/FeedbackCard.vue';
import FeedbackForm from '../components/FeedbackForm.vue';
import FilterPanel from '../components/FilterPanel.vue';
import SummaryPanel from '../components/SummaryPanel.vue';
import SmartAlerts from '../components/SmartAlerts.vue';
import MergeModal from '../components/MergeModal.vue';
import MergeItemCard from '../components/MergeItemCard.vue';
import { useFeedback } from '../composables/useFeedback';
import { useFilter } from '../composables/useFilter';
import { useSmartDetect } from '../composables/useSmartDetect';
import type { Feedback, SmartAlert, FeedbackStatus } from '../types/feedback';
import { downloadJSON } from '../utils/helpers';

const {
  feedbacks,
  mergeItems,
  activeFeedbacks,
  pendingCount,
  processingCount,
  resolvedCount,
  allSnackNames,
  allBatches,
  allFeedbackPersons,
  allAssignees,
  upcomingCount,
  overdueCount,
  upcomingFeedbacks,
  overdueFeedbacks,
  addFeedback,
  updateFeedback,
  deleteFeedback,
  addMergeItem,
  undoMerge,
  updateMergeItemStatus,
  exportAllData,
} = useFeedback();

const {
  filters,
  filteredFeedbacks,
  hasActiveFilters,
  toggleFilter,
  clearAllFilters,
  isFilterActive,
  setFilter,
} = useFilter(feedbacks);

const { allAlerts, batchScores, frequentIssues } = useSmartDetect(feedbacks);

const showForm = ref(false);
const editingFeedback = ref<Feedback | null>(null);
const showMergeModal = ref(false);
const selectedFeedbackIds = ref<Set<string>>(new Set());
const viewMode = ref<'cards' | 'list'>('cards');
const showMerged = ref(true);

const selectedFeedbacks = computed(() => {
  return filteredFeedbacks.value.filter((f) => selectedFeedbackIds.value.has(f.id));
});

const canMerge = computed(() => selectedFeedbacks.value.length >= 2);

const visibleAlerts = ref<SmartAlert[]>([]);

function refreshAlerts() {
  visibleAlerts.value = [...allAlerts.value];
}

function handleAdd() {
  editingFeedback.value = null;
  showForm.value = true;
}

function handleEdit(feedback: Feedback) {
  editingFeedback.value = feedback;
  showForm.value = true;
}

function handleDelete(id: string) {
  if (confirm('确定要删除这条反馈吗？')) {
    deleteFeedback(id);
    selectedFeedbackIds.value.delete(id);
  }
}

function handleFormSubmit(data: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'> & { status?: FeedbackStatus }) {
  if (editingFeedback.value) {
    updateFeedback(editingFeedback.value.id, data);
  } else {
    addFeedback(data);
  }
  showForm.value = false;
  editingFeedback.value = null;
}

function handleSelect(id: string, selected: boolean) {
  if (selected) {
    selectedFeedbackIds.value.add(id);
  } else {
    selectedFeedbackIds.value.delete(id);
  }
  selectedFeedbackIds.value = new Set(selectedFeedbackIds.value);
}

function handleMerge() {
  if (canMerge.value) {
    showMergeModal.value = true;
  }
}

function handleMergeConfirm(title: string) {
  const ids = Array.from(selectedFeedbackIds.value);
  addMergeItem(title, ids);
  selectedFeedbackIds.value.clear();
  showMergeModal.value = false;
}

function handleUndoMerge(mergeItemId: string) {
  undoMerge(mergeItemId);
}

function handleMergeStatusUpdate(id: string, status: FeedbackStatus) {
  updateMergeItemStatus(id, status);
}

function handleExport() {
  const data = exportAllData();
  const date = new Date().toISOString().slice(0, 10);
  downloadJSON(data, `茶点试吃反馈-${date}.json`);
}

function handleFocusAlert(alert: SmartAlert) {
  clearAllFilters();
  selectedFeedbackIds.value.clear();

  switch (alert.type) {
    case 'high_priority_pending':
      setFilter('priority', ['high']);
      setFilter('status', ['pending']);
      break;
    case 'upcoming_deadline':
      setFilter('dueStatus', ['upcoming']);
      break;
    case 'overdue_feedback':
      setFilter('dueStatus', ['overdue']);
      break;
    case 'negative_batch':
    case 'missing_fields':
    case 'duplicate_suggestion':
    default:
      break;
  }

  alert.relatedFeedbackIds.forEach((id) => {
    if (activeFeedbacks.value.some((f) => f.id === id)) {
      selectedFeedbackIds.value.add(id);
    }
  });
}

function handleFocusIssue(feedbackIds: string[]) {
  clearAllFilters();
  selectedFeedbackIds.value.clear();
  feedbackIds.forEach((id) => {
    if (activeFeedbacks.value.some((f) => f.id === id)) {
      selectedFeedbackIds.value.add(id);
    }
  });
}

function handleFocusSummary(type: 'pending' | 'processing' | 'resolved' | 'upcoming' | 'overdue') {
  clearAllFilters();
  selectedFeedbackIds.value.clear();

  let ids: string[] = [];
  switch (type) {
    case 'pending':
      setFilter('status', ['pending']);
      break;
    case 'processing':
      setFilter('status', ['processing']);
      break;
    case 'resolved':
      setFilter('status', ['resolved']);
      break;
    case 'upcoming':
      setFilter('dueStatus', ['upcoming']);
      ids = upcomingFeedbacks.value.map((f) => f.id);
      break;
    case 'overdue':
      setFilter('dueStatus', ['overdue']);
      ids = overdueFeedbacks.value.map((f) => f.id);
      break;
  }

  ids.forEach((id) => selectedFeedbackIds.value.add(id));
}

function handleDismissAlert(alertId: string) {
  visibleAlerts.value = visibleAlerts.value.filter((a) => a.id !== alertId);
}

onMounted(() => {
  refreshAlerts();
});
</script>

<template>
  <div class="min-h-screen">
    <header class="bg-white/80 backdrop-blur-md border-b border-tea-100 sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-tea-400 to-tea-600 flex items-center justify-center shadow-lg shadow-tea-200">
              <Cookie class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-tea-800 font-serif">茶点试吃反馈</h1>
              <p class="text-xs text-tea-500">研发小组 · 口味管理</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button @click="handleExport" class="btn-secondary flex items-center gap-2">
              <Download class="w-4 h-4" />
              <span class="hidden sm:inline">导出 JSON</span>
            </button>
            <button @click="handleAdd" class="btn-primary flex items-center gap-2">
              <Plus class="w-4 h-4" />
              <span class="hidden sm:inline">新增反馈</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex gap-6">
        <aside class="w-72 flex-shrink-0 hidden lg:block">
          <div class="sticky top-24 space-y-5">
            <FilterPanel
              :filters="filters"
              :snack-options="allSnackNames"
              :batch-options="allBatches"
              :person-options="allFeedbackPersons"
              :assignee-options="allAssignees"
              :has-active-filters="hasActiveFilters"
              @toggle-filter="toggleFilter"
              @clear-all="clearAllFilters"
            />

            <SummaryPanel
              :pending-count="pendingCount"
              :processing-count="processingCount"
              :resolved-count="resolvedCount"
              :upcoming-count="upcomingCount"
              :overdue-count="overdueCount"
              :batch-scores="batchScores"
              :frequent-issues="frequentIssues"
              @focus-issue="handleFocusIssue"
              @focus-summary="handleFocusSummary"
            />
          </div>
        </aside>

        <section class="flex-1 min-w-0">
          <SmartAlerts
            :alerts="visibleAlerts"
            @focus-alert="handleFocusAlert"
            @dismiss="handleDismissAlert"
          />

          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <h2 class="text-lg font-semibold text-tea-800 font-serif">
                反馈列表
                <span class="text-sm font-normal text-tea-500 ml-2">
                  共 {{ filteredFeedbacks.length }} 条
                </span>
              </h2>
              <span
                v-if="selectedFeedbacks.length > 0"
                class="text-xs text-tea-500 bg-tea-50 px-2 py-1 rounded-full"
              >
                已选 {{ selectedFeedbacks.length }} 条
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="canMerge"
                @click="handleMerge"
                class="btn-secondary text-sm flex items-center gap-1.5"
              >
                <Merge class="w-4 h-4" />
                合并选中
              </button>
              <button
                @click="showMerged = !showMerged"
                class="p-2 rounded-lg text-tea-500 hover:bg-tea-50 transition-colors"
                :class="{ 'bg-tea-100 text-tea-700': showMerged }"
                title="显示合并项"
              >
                <LayoutGrid class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="lg:hidden mb-5">
            <FilterPanel
              :filters="filters"
              :snack-options="allSnackNames"
              :batch-options="allBatches"
              :person-options="allFeedbackPersons"
              :assignee-options="allAssignees"
              :has-active-filters="hasActiveFilters"
              @toggle-filter="toggleFilter"
              @clear-all="clearAllFilters"
            />
          </div>

          <div v-if="showMerged && mergeItems.length > 0" class="mb-6">
            <h3 class="text-sm font-semibold text-tea-700 mb-3 flex items-center gap-2">
              <LayoutGrid class="w-4 h-4" />
              合并处理项 ({{ mergeItems.length }})
            </h3>
            <div class="grid gap-4 md:grid-cols-2">
              <MergeItemCard
                v-for="item in mergeItems"
                :key="item.id"
                :merge-item="item"
                :feedbacks="feedbacks.filter(f => item.feedbackIds.includes(f.id))"
                @undo="handleUndoMerge"
                @update-status="handleMergeStatusUpdate"
              />
            </div>
          </div>

          <div v-if="filteredFeedbacks.length === 0" class="text-center py-16">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-tea-50 flex items-center justify-center">
              <Cookie class="w-10 h-10 text-tea-300" />
            </div>
            <p class="text-tea-500 mb-2">暂无符合条件的反馈</p>
            <button v-if="hasActiveFilters" @click="clearAllFilters" class="text-sm text-tea-600 hover:text-tea-800">
              清除筛选条件
            </button>
            <button v-else @click="handleAdd" class="btn-primary mt-3">
              添加第一条反馈
            </button>
          </div>

          <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FeedbackCard
              v-for="(feedback, index) in filteredFeedbacks"
              :key="feedback.id"
              :feedback="feedback"
              :selected="selectedFeedbackIds.has(feedback.id)"
              :selectable="true"
              :show-actions="true"
              :style="{ animationDelay: `${index * 50}ms` }"
              @edit="handleEdit"
              @delete="handleDelete"
              @select="handleSelect"
            />
          </div>
        </section>
      </div>
    </main>

    <FeedbackForm
      :visible="showForm"
      :feedback="editingFeedback"
      :snack-options="allSnackNames"
      :batch-options="allBatches"
      :person-options="allFeedbackPersons"
      @close="showForm = false"
      @submit="handleFormSubmit"
    />

    <MergeModal
      :visible="showMergeModal"
      :selected-feedbacks="selectedFeedbacks"
      @close="showMergeModal = false"
      @confirm="handleMergeConfirm"
    />
  </div>
</template>
