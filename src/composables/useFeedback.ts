import { ref, computed } from 'vue';
import type { Feedback, MergeItem, Priority, FeedbackStatus } from '../types/feedback';
import { generateId, getDueStatus } from '../utils/helpers';
import { useStorage } from './useStorage';

const STORAGE_KEY = 'tea-snack-feedback';

function getDateWithOffset(daysOffset: number, hours: number = 10): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

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
    status: 'processing',
    assignee: '李研发',
    dueDate: getDateWithOffset(-2),
    handleNote: '已联系供应商更换抹茶粉，等待样品确认',
    lastFollowUpAt: getDateWithOffset(-1, 15),
    createdAt: getDateWithOffset(-15),
    updatedAt: getDateWithOffset(-1, 15),
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
    assignee: '王品控',
    dueDate: getDateWithOffset(2),
    handleNote: '',
    lastFollowUpAt: getDateWithOffset(-3, 11),
    createdAt: getDateWithOffset(-12),
    updatedAt: getDateWithOffset(-3, 11),
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
    assignee: '李研发',
    dueDate: getDateWithOffset(1),
    handleNote: '初步判断是烘烤温度偏高，正在做对比实验',
    lastFollowUpAt: getDateWithOffset(0, 9),
    createdAt: getDateWithOffset(-10),
    updatedAt: getDateWithOffset(0, 9),
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
    assignee: '张配方师',
    dueDate: getDateWithOffset(7),
    handleNote: '已调整糖的配比，下周小批量试产',
    lastFollowUpAt: getDateWithOffset(-2, 14),
    createdAt: getDateWithOffset(-8),
    updatedAt: getDateWithOffset(-2, 14),
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
    assignee: '张配方师',
    dueDate: getDateWithOffset(-5),
    handleNote: '酥皮已优化为32层折叠工艺，口感更酥松',
    lastFollowUpAt: getDateWithOffset(-6, 16),
    createdAt: getDateWithOffset(-20),
    updatedAt: getDateWithOffset(-6, 16),
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
    assignee: '',
    dueDate: '',
    handleNote: '该批次反馈良好，维持现有配方',
    lastFollowUpAt: getDateWithOffset(-10, 10),
    createdAt: getDateWithOffset(-25),
    updatedAt: getDateWithOffset(-10, 10),
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
    assignee: '王品控',
    dueDate: getDateWithOffset(-5),
    handleNote: '客户强烈投诉，需要优先处理',
    lastFollowUpAt: getDateWithOffset(-4, 11),
    createdAt: getDateWithOffset(-18),
    updatedAt: getDateWithOffset(-4, 11),
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
    status: 'processing',
    assignee: '李研发',
    dueDate: getDateWithOffset(3),
    handleNote: '正在做甜度梯度测试，已验证15%减糖方案',
    lastFollowUpAt: getDateWithOffset(-1, 16),
    createdAt: getDateWithOffset(-15),
    updatedAt: getDateWithOffset(-1, 16),
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
    assignee: '',
    dueDate: '',
    handleNote: '',
    lastFollowUpAt: '',
    createdAt: getDateWithOffset(-5),
    updatedAt: getDateWithOffset(-5),
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
    assignee: '张配方师',
    dueDate: getDateWithOffset(15),
    handleNote: '',
    lastFollowUpAt: '',
    createdAt: getDateWithOffset(-3),
    updatedAt: getDateWithOffset(-3),
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

  const allAssignees = computed(() => {
    return [...new Set(feedbacks.value.map((f) => f.assignee).filter(Boolean) as string[])].sort();
  });

  const upcomingCount = computed(() => {
    return activeFeedbacks.value.filter(
      (f) => getDueStatus(f.dueDate, f.status) === 'upcoming'
    ).length;
  });

  const overdueCount = computed(() => {
    return activeFeedbacks.value.filter(
      (f) => getDueStatus(f.dueDate, f.status) === 'overdue'
    ).length;
  });

  const upcomingFeedbacks = computed(() => {
    return activeFeedbacks.value.filter(
      (f) => getDueStatus(f.dueDate, f.status) === 'upcoming'
    );
  });

  const overdueFeedbacks = computed(() => {
    return activeFeedbacks.value.filter(
      (f) => getDueStatus(f.dueDate, f.status) === 'overdue'
    );
  });

  function addFeedback(feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'> & { status?: FeedbackStatus }) {
    const now = new Date().toISOString();
    const newFeedback: Feedback = {
      id: generateId(),
      ...feedbackData,
      status: feedbackData.status || 'pending',
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
    const originalStatuses: Record<string, FeedbackStatus> = {};
    feedbackIds.forEach((id) => {
      const feedback = feedbacks.value.find((f) => f.id === id);
      if (feedback) {
        originalStatuses[id] = feedback.status;
      }
    });

    const newMergeItem: MergeItem = {
      id: generateId(),
      title,
      feedbackIds,
      originalStatuses,
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
        const originalStatus = mergeItem.originalStatuses?.[id] || 'pending';
        updateFeedback(id, { status: originalStatus, mergedIntoId: undefined });
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
    allAssignees,
    upcomingCount,
    overdueCount,
    upcomingFeedbacks,
    overdueFeedbacks,
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
