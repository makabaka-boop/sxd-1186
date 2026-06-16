export type Priority = 'high' | 'medium' | 'low';

export type FeedbackStatus = 'pending' | 'processing' | 'resolved' | 'merged';

export type DueStatus = 'normal' | 'upcoming' | 'overdue' | 'no_due';

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
  assignee?: string;
  dueDate?: string;
  handleNote?: string;
  lastFollowUpAt?: string;
}

export interface MergeItem {
  id: string;
  title: string;
  feedbackIds: string[];
  originalStatuses: Record<string, FeedbackStatus>;
  status: FeedbackStatus;
  createdAt: string;
}

export interface FilterOptions {
  snackName: string[];
  batch: string[];
  priority: Priority[];
  status: FeedbackStatus[];
  feedbackPerson: string[];
  assignee: string[];
  dueStatus: DueStatus[];
}

export type AlertType =
  | 'negative_batch'
  | 'missing_fields'
  | 'duplicate_suggestion'
  | 'high_priority_pending'
  | 'upcoming_deadline'
  | 'overdue_feedback';

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

export const DUE_STATUS_LABELS: Record<DueStatus, string> = {
  normal: '正常',
  upcoming: '即将到期',
  overdue: '已逾期',
  no_due: '未设置',
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  negative_batch: '负面反馈集中',
  missing_fields: '字段缺失',
  duplicate_suggestion: '相似建议',
  high_priority_pending: '高优先级待处理',
  upcoming_deadline: '截止日临近',
  overdue_feedback: '处理已逾期',
};
