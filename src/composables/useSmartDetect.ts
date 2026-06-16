import { computed } from 'vue';
import type { Feedback, SmartAlert, BatchScore, FrequentIssue } from '../types/feedback';
import { textSimilarity, generateId, getDueStatus, getDaysRemaining } from '../utils/helpers';

export function useSmartDetect(feedbacks: { value: Feedback[] }) {
  const negativeBatchAlerts = computed(() => {
    const alerts: SmartAlert[] = [];
    const batchMap = new Map<string, Feedback[]>();

    feedbacks.value.forEach((f) => {
      if (f.status === 'merged') return;
      const key = `${f.snackName}_${f.batch}`;
      if (!batchMap.has(key)) {
        batchMap.set(key, []);
      }
      batchMap.get(key)!.push(f);
    });

    batchMap.forEach((batchFeedbacks, key) => {
      const negativeFeedbacks = batchFeedbacks.filter((f) => f.sweetness <= 2);
      if (negativeFeedbacks.length >= 3) {
        const [snackName, batch] = key.split('_');
        alerts.push({
          id: generateId(),
          type: 'negative_batch',
          title: `${snackName} (${batch}) 负面反馈集中`,
          description: `该批次有 ${negativeFeedbacks.length} 条低甜度评价反馈，需要重点关注。`,
          relatedFeedbackIds: negativeFeedbacks.map((f) => f.id),
        });
      }
    });

    return alerts;
  });

  const missingFieldsAlerts = computed(() => {
    const alerts: SmartAlert[] = [];
    const missingFeedbacks = feedbacks.value.filter((f) => {
      if (f.status === 'merged') return false;
      return !f.suggestion || f.suggestion.trim() === '' || f.textureKeywords.length === 0;
    });

    if (missingFeedbacks.length > 0) {
      const missingSuggestion = missingFeedbacks.filter((f) => !f.suggestion || f.suggestion.trim() === '');
      const missingKeywords = missingFeedbacks.filter((f) => f.textureKeywords.length === 0);

      let description = `发现 ${missingFeedbacks.length} 条反馈缺少关键字段。`;
      if (missingSuggestion.length > 0) description += ` 其中 ${missingSuggestion.length} 条缺少改进建议。`;
      if (missingKeywords.length > 0) description += ` ${missingKeywords.length} 条缺少口感关键词。`;

      alerts.push({
        id: generateId(),
        type: 'missing_fields',
        title: '存在字段缺失的反馈',
        description,
        relatedFeedbackIds: missingFeedbacks.map((f) => f.id),
      });
    }

    return alerts;
  });

  const duplicateSuggestionAlerts = computed(() => {
    const alerts: SmartAlert[] = [];
    const activeFeedbacks = feedbacks.value.filter((f) => f.status !== 'merged' && f.suggestion.trim());
    const processed = new Set<string>();
    const similarGroups: string[][] = [];

    for (let i = 0; i < activeFeedbacks.length; i++) {
      if (processed.has(activeFeedbacks[i].id)) continue;

      const group: string[] = [activeFeedbacks[i].id];
      processed.add(activeFeedbacks[i].id);

      for (let j = i + 1; j < activeFeedbacks.length; j++) {
        if (processed.has(activeFeedbacks[j].id)) continue;
        if (activeFeedbacks[i].snackName !== activeFeedbacks[j].snackName) continue;

        const similarity = textSimilarity(activeFeedbacks[i].suggestion, activeFeedbacks[j].suggestion);
        if (similarity >= 0.5) {
          group.push(activeFeedbacks[j].id);
          processed.add(activeFeedbacks[j].id);
        }
      }

      if (group.length >= 2) {
        similarGroups.push(group);
      }
    }

    similarGroups.forEach((group, index) => {
      const firstFeedback = feedbacks.value.find((f) => f.id === group[0]);
      if (firstFeedback) {
        alerts.push({
          id: generateId(),
          type: 'duplicate_suggestion',
          title: `相似建议 #${index + 1}：${firstFeedback.snackName}`,
          description: `发现 ${group.length} 条相似的改进建议，建议合并处理。`,
          relatedFeedbackIds: group,
        });
      }
    });

    return alerts;
  });

  const highPriorityAlerts = computed(() => {
    const alerts: SmartAlert[] = [];
    const highPriorityPending = feedbacks.value.filter(
      (f) => f.priority === 'high' && f.status === 'pending'
    );

    if (highPriorityPending.length > 0) {
      alerts.push({
        id: generateId(),
        type: 'high_priority_pending',
        title: '高优先级待处理提醒',
        description: `有 ${highPriorityPending.length} 条高优先级反馈尚未处理，请及时跟进。`,
        relatedFeedbackIds: highPriorityPending.map((f) => f.id),
      });
    }

    return alerts;
  });

  const upcomingDeadlineAlerts = computed(() => {
    const alerts: SmartAlert[] = [];
    const highPriorityUpcoming = feedbacks.value.filter((f) => {
      if (f.status === 'resolved' || f.status === 'merged') return false;
      if (f.priority !== 'high') return false;
      return getDueStatus(f.dueDate, f.status) === 'upcoming';
    });

    if (highPriorityUpcoming.length > 0) {
      const minDays = Math.min(
        ...highPriorityUpcoming.map((f) => getDaysRemaining(f.dueDate) ?? 999)
      );
      alerts.push({
        id: generateId(),
        type: 'upcoming_deadline',
        title: `高优先级反馈即将到期（${minDays <= 1 ? '明日' : minDays + '天内'}截止）`,
        description: `有 ${highPriorityUpcoming.length} 条高优先级反馈将在 3 天内到期，请优先处理。`,
        relatedFeedbackIds: highPriorityUpcoming.map((f) => f.id),
      });
    }

    return alerts;
  });

  const overdueFeedbackAlerts = computed(() => {
    const alerts: SmartAlert[] = [];
    const overdueList = feedbacks.value.filter((f) => {
      if (f.status === 'resolved' || f.status === 'merged') return false;
      return getDueStatus(f.dueDate, f.status) === 'overdue';
    });

    if (overdueList.length > 0) {
      const highPriorityOverdue = overdueList.filter((f) => f.priority === 'high');
      alerts.push({
        id: generateId(),
        type: 'overdue_feedback',
        title: `已逾期反馈提醒${highPriorityOverdue.length > 0 ? '（含高优先级）' : ''}`,
        description: `有 ${overdueList.length} 条反馈已超过预计完成时间，其中 ${highPriorityOverdue.length} 条为高优先级，请立即跟进处理。`,
        relatedFeedbackIds: overdueList.map((f) => f.id),
      });
    }

    return alerts;
  });

  const allAlerts = computed(() => {
    return [
      ...overdueFeedbackAlerts.value,
      ...upcomingDeadlineAlerts.value,
      ...highPriorityAlerts.value,
      ...negativeBatchAlerts.value,
      ...duplicateSuggestionAlerts.value,
      ...missingFieldsAlerts.value,
    ];
  });

  const batchScores = computed(() => {
    const scores: BatchScore[] = [];
    const batchMap = new Map<string, Feedback[]>();

    feedbacks.value.forEach((f) => {
      if (f.status === 'merged') return;
      const key = `${f.snackName}_${f.batch}`;
      if (!batchMap.has(key)) {
        batchMap.set(key, []);
      }
      batchMap.get(key)!.push(f);
    });

    batchMap.forEach((batchFeedbacks, key) => {
      const [snackName, batch] = key.split('_');
      const avgSweetness =
        batchFeedbacks.reduce((sum, f) => sum + f.sweetness, 0) / batchFeedbacks.length;
      const negativeCount = batchFeedbacks.filter((f) => f.sweetness <= 2).length;

      scores.push({
        batch,
        snackName,
        avgSweetness: Math.round(avgSweetness * 10) / 10,
        feedbackCount: batchFeedbacks.length,
        negativeCount,
      });
    });

    return scores.sort((a, b) => b.avgSweetness - a.avgSweetness);
  });

  const frequentIssues = computed(() => {
    const keywordCount = new Map<string, { count: number; feedbackIds: string[] }>();

    feedbacks.value.forEach((f) => {
      if (f.status === 'merged') return;
      f.textureKeywords.forEach((keyword) => {
        if (!keywordCount.has(keyword)) {
          keywordCount.set(keyword, { count: 0, feedbackIds: [] });
        }
        const data = keywordCount.get(keyword)!;
        data.count++;
        if (!data.feedbackIds.includes(f.id)) {
          data.feedbackIds.push(f.id);
        }
      });
    });

    const issues: FrequentIssue[] = [];
    keywordCount.forEach((data, keyword) => {
      if (data.count >= 2) {
        issues.push({
          keyword,
          count: data.count,
          feedbackIds: data.feedbackIds,
        });
      }
    });

    return issues.sort((a, b) => b.count - a.count).slice(0, 8);
  });

  return {
    allAlerts,
    negativeBatchAlerts,
    missingFieldsAlerts,
    duplicateSuggestionAlerts,
    highPriorityAlerts,
    upcomingDeadlineAlerts,
    overdueFeedbackAlerts,
    batchScores,
    frequentIssues,
  };
}
