export type Priority = 'high' | 'medium' | 'low';

export type FeedbackStatus = 'pending' | 'processing' | 'resolved' | 'merged';

export interface Feedback {
  id: string;
  snackName: string;
  batch: string;
  sweetness: number;
  textureKeywords: string[];
  suggestion: string;
  feedbackPerson: string;
  priority: Priority;
  status: FeedbackStatus;
  mergedIntoId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MergeItem {
  id: string;
  title: string;
  feedbackIds: string[];
  status: FeedbackStatus;
  createdAt: string;
}

export interface FilterOptions {
  snackName: string[];
  batch: string[];
  priority: Priority[];
  status: FeedbackStatus[];
  feedbackPerson: string[];
}

export type AlertType = 'negative_batch' | 'missing_fields' | 'duplicate_suggestion' | 'high_priority_pending';

export interface SmartAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  relatedFeedbackIds: string[];
}

export interface BatchScore {
  batch: string;
  snackName: string;
  avgSweetness: number;
  feedbackCount: number;
  negativeCount: number;
}

export interface FrequentIssue {
  keyword: string;
  count: number;
  feedbackIds: string[];
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export const STATUS_LABELS: Record<FeedbackStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  merged: '已合并',
};

export const SWEETNESS_LABELS: Record<number, string> = {
  1: '太淡',
  2: '偏淡',
  3: '适中',
  4: '偏甜',
  5: '太甜',
};
