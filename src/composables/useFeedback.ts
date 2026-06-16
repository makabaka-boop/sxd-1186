import { ref, computed } from 'vue';
import type { Feedback, MergeItem, Priority, FeedbackStatus } from '../types/feedback';
import { generateId } from '../utils/helpers';
import { useStorage } from './useStorage';

const STORAGE_KEY = 'tea-snack-feedback';

const mockFeedbacks: Feedback[] = [
  {
    id: 'fb001',
    snackName: '抹茶曲奇',
    batch: 'B20240601',
    sweetness: 2,
    textureKeywords: ['酥脆', '茶香'],
    suggestion: '抹茶味可以再浓郁一些，目前茶味偏淡',
    feedbackPerson: '张小明',
    priority: 'high',
    status: 'pending',
    createdAt: '2024-06-01T10:30:00',
    updatedAt: '2024-06-01T10:30:00',
  },
  {
    id: 'fb002',
    snackName: '抹茶曲奇',
    batch: 'B20240601',
    sweetness: 3,
    textureKeywords: ['酥脆', '香浓'],
    suggestion: '口感不错，但抹茶香气可以更突出',
    feedbackPerson: '李小红',
    priority: 'medium',
    status: 'pending',
    createdAt: '2024-06-01T11:00:00',
    updatedAt: '2024-06-01T11:00:00',
  },
  {
    id: 'fb003',
    snackName: '抹茶曲奇',
    batch: 'B20240601',
    sweetness: 1,
    textureKeywords: ['偏硬'],
    suggestion: '甜度太低了，而且饼干有点硬',
    feedbackPerson: '王大力',
    priority: 'high',
    status: 'pending',
    createdAt: '2024-06-01T14:20:00',
    updatedAt: '2024-06-01T14:20:00',
  },
  {
    id: 'fb004',
    snackName: '蛋黄酥',
    batch: 'B20240602',
    sweetness: 4,
    textureKeywords: ['酥软', '香甜'],
    suggestion: '蛋黄味道很正，就是有点太甜了',
    feedbackPerson: '赵小美',
    priority: 'medium',
    status: 'processing',
    createdAt: '2024-06-02T09:15:00',
    updatedAt: '2024-06-02T09:15:00',
  },
  {
    id: 'fb005',
    snackName: '蛋黄酥',
    batch: 'B20240602',
    sweetness: 3,
    textureKeywords: ['酥软', '层次分明'],
    suggestion: '整体很好，酥皮层次可以再多一些',
    feedbackPerson: '张小明',
    priority: 'low',
    status: 'resolved',
    createdAt: '2024-06-02T10:30:00',
    updatedAt: '2024-06-03T16:00:00',
  },
  {
    id: 'fb006',
    snackName: '桂花糕',
    batch: 'B20240603',
    sweetness: 3,
    textureKeywords: ['软糯', '清香'],
    suggestion: '桂花香气很自然，口感软糯适中',
    feedbackPerson: '李小红',
    priority: 'low',
    status: 'resolved',
    createdAt: '2024-06-03T11:00:00',
    updatedAt: '2024-06-03T11:00:00',
  },
  {
    id: 'fb007',
    snackName: '桂花糕',
    batch: 'B20240603',
    sweetness: 5,
    textureKeywords: ['太甜'],
    suggestion: '甜度超标了，减糖至少30%',
    feedbackPerson: '王大力',
    priority: 'high',
    status: 'pending',
    createdAt: '2024-06-03T14:00:00',
    updatedAt: '2024-06-03T14:00:00',
  },
  {
    id: 'fb008',
    snackName: '桂花糕',
    batch: 'B20240603',
    sweetness: 4,
    textureKeywords: ['偏甜', '软糯'],
    suggestion: '甜味有点重，盖过了桂花香',
    feedbackPerson: '赵小美',
    priority: 'high',
    status: 'pending',
    createdAt: '2024-06-03T15:30:00',
    updatedAt: '2024-06-03T15:30:00',
  },
  {
    id: 'fb009',
    snackName: '绿豆糕',
    batch: 'B20240604',
    sweetness: 2,
    textureKeywords: ['细腻', '清爽'],
    suggestion: '口感细腻，绿豆味很纯正',
    feedbackPerson: '张小明',
    priority: 'medium',
    status: 'pending',
    createdAt: '2024-06-04T10:00:00',
    updatedAt: '2024-06-04T10:00:00',
  },
  {
    id: 'fb010',
    snackName: '绿豆糕',
    batch: 'B20240604',
    sweetness: 3,
    textureKeywords: ['细腻'],
    suggestion: '',
    feedbackPerson: '陈老师',
    priority: 'low',
    status: 'pending',
    createdAt: '2024-06-04T11:20:00',
    updatedAt: '2024-06-04T11:20:00',
  },
];

const mockMergeItems: MergeItem[] = [];

export function useFeedback() {
  const feedbackStorage = useStorage<Feedback[]>(`${STORAGE_KEY}-feedbacks`, []);
  const mergeItemsStorage = useStorage<MergeItem[]>(`${STORAGE_KEY}-mergeItems`, []);

  const feedbacks = feedbackStorage.data;
  const mergeItems = mergeItemsStorage.data;

  if (feedbacks.value.length === 0) {
    feedbacks.value = mockFeedbacks;
  }

  const activeFeedbacks = computed(() => {
    return feedbacks.value.filter((f) => f.status !== 'merged');
  });

  const pendingCount = computed(() => {
    return activeFeedbacks.value.filter((f) => f.status === 'pending').length;
  });

  const processingCount = computed(() => {
    return activeFeedbacks.value.filter((f) => f.status === 'processing').length;
  });

  const resolvedCount = computed(() => {
    return activeFeedbacks.value.filter((f) => f.status === 'resolved').length;
  });

  const highPriorityPending = computed(() => {
    return activeFeedbacks.value.filter((f) => f.priority === 'high' && f.status === 'pending');
  });

  const allSnackNames = computed(() => {
    return [...new Set(feedbacks.value.map((f) => f.snackName))].sort();
  });

  const allBatches = computed(() => {
    return [...new Set(feedbacks.value.map((f) => f.batch))].sort();
  });

  const allFeedbackPersons = computed(() => {
    return [...new Set(feedbacks.value.map((f) => f.feedbackPerson))].sort();
  });

  function addFeedback(feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    const now = new Date().toISOString();
    const newFeedback: Feedback = {
      id: generateId(),
      ...feedbackData,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    feedbacks.value.push(newFeedback);
    return newFeedback;
  }

  function updateFeedback(id: string, updates: Partial<Feedback>) {
    const index = feedbacks.value.findIndex((f) => f.id === id);
    if (index !== -1) {
      feedbacks.value[index] = {
        ...feedbacks.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  function deleteFeedback(id: string) {
    const index = feedbacks.value.findIndex((f) => f.id === id);
    if (index !== -1) {
      const feedback = feedbacks.value[index];
      if (feedback.mergedIntoId) {
        const mergeItem = mergeItems.value.find((m) => m.id === feedback.mergedIntoId);
        if (mergeItem) {
          mergeItem.feedbackIds = mergeItem.feedbackIds.filter((fid) => fid !== id);
        }
      }
      feedbacks.value.splice(index, 1);
    }
  }

  function getFeedbackById(id: string): Feedback | undefined {
    return feedbacks.value.find((f) => f.id === id);
  }

  function addMergeItem(title: string, feedbackIds: string[]) {
    const newMergeItem: MergeItem = {
      id: generateId(),
      title,
      feedbackIds,
      status: 'processing',
      createdAt: new Date().toISOString(),
    };
    mergeItems.value.push(newMergeItem);

    feedbackIds.forEach((id) => {
      updateFeedback(id, { status: 'merged', mergedIntoId: newMergeItem.id });
    });

    return newMergeItem;
  }

  function undoMerge(mergeItemId: string) {
    const mergeItemIndex = mergeItems.value.findIndex((m) => m.id === mergeItemId);
    if (mergeItemIndex !== -1) {
      const mergeItem = mergeItems.value[mergeItemIndex];
      mergeItem.feedbackIds.forEach((id) => {
        updateFeedback(id, { status: 'pending', mergedIntoId: undefined });
      });
      mergeItems.value.splice(mergeItemIndex, 1);
    }
  }

  function updateMergeItemStatus(id: string, status: FeedbackStatus) {
    const mergeItem = mergeItems.value.find((m) => m.id === id);
    if (mergeItem) {
      mergeItem.status = status;
    }
  }

  function getMergeItemById(id: string): MergeItem | undefined {
    return mergeItems.value.find((m) => m.id === id);
  }

  function exportAllData() {
    return {
      feedbacks: feedbackStorage.exportData(),
      mergeItems: mergeItemsStorage.exportData(),
      exportedAt: new Date().toISOString(),
    };
  }

  function importAllData(data: { feedbacks: Feedback[]; mergeItems: MergeItem[] }) {
    feedbackStorage.importData(data.feedbacks);
    mergeItemsStorage.importData(data.mergeItems);
  }

  function clearAllData() {
    feedbackStorage.clearStorage();
    mergeItemsStorage.clearStorage();
  }

  return {
    feedbacks,
    mergeItems,
    activeFeedbacks,
    pendingCount,
    processingCount,
    resolvedCount,
    highPriorityPending,
    allSnackNames,
    allBatches,
    allFeedbackPersons,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    getFeedbackById,
    addMergeItem,
    undoMerge,
    updateMergeItemStatus,
    getMergeItemById,
    exportAllData,
    importAllData,
    clearAllData,
  };
}
