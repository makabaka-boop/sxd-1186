import { ref, computed } from 'vue';
import type { Feedback, FilterOptions, Priority, FeedbackStatus } from '../types/feedback';
import { getDueStatus } from '../utils/helpers';

export function useFilter(feedbacks: ReturnType<typeof ref<Feedback[]>> | { value: Feedback[] }) {
  const filters = ref<FilterOptions>({
    snackName: [],
    batch: [],
    priority: [],
    status: [],
    feedbackPerson: [],
    assignee: [],
    dueStatus: [],
  });

  const filteredFeedbacks = computed(() => {
    return feedbacks.value.filter((feedback) => {
      if (filters.value.snackName.length > 0 && !filters.value.snackName.includes(feedback.snackName)) {
        return false;
      }
      if (filters.value.batch.length > 0 && !filters.value.batch.includes(feedback.batch)) {
        return false;
      }
      if (filters.value.priority.length > 0 && !filters.value.priority.includes(feedback.priority)) {
        return false;
      }
      if (filters.value.status.length > 0 && !filters.value.status.includes(feedback.status)) {
        return false;
      }
      if (
        filters.value.feedbackPerson.length > 0 &&
        !filters.value.feedbackPerson.includes(feedback.feedbackPerson)
      ) {
        return false;
      }
      if (filters.value.assignee.length > 0) {
        const hasUnassigned = filters.value.assignee.includes('__unassigned__');
        const matchAssignee = feedback.assignee && filters.value.assignee.includes(feedback.assignee);
        if (hasUnassigned && !feedback.assignee) {
          // match
        } else if (!matchAssignee) {
          return false;
        }
      }
      if (filters.value.dueStatus.length > 0) {
        const status = getDueStatus(feedback.dueDate, feedback.status);
        if (!filters.value.dueStatus.includes(status)) {
          return false;
        }
      }
      return true;
    });
  });

  const hasActiveFilters = computed(() => {
    return (
      filters.value.snackName.length > 0 ||
      filters.value.batch.length > 0 ||
      filters.value.priority.length > 0 ||
      filters.value.status.length > 0 ||
      filters.value.feedbackPerson.length > 0 ||
      filters.value.assignee.length > 0 ||
      filters.value.dueStatus.length > 0
    );
  });

  function toggleFilter(field: keyof FilterOptions, value: string) {
    const current = filters.value[field];
    const index = current.indexOf(value as never);
    if (index === -1) {
      current.push(value as never);
    } else {
      current.splice(index, 1);
    }
  }

  function clearAllFilters() {
    filters.value = {
      snackName: [],
      batch: [],
      priority: [],
      status: [],
      feedbackPerson: [],
      assignee: [],
      dueStatus: [],
    };
  }

  function setFilter(field: keyof FilterOptions, values: string[]) {
    (filters.value[field] as string[]) = [...values];
  }

  function isFilterActive(field: keyof FilterOptions, value: string): boolean {
    return filters.value[field].includes(value as never);
  }

  return {
    filters,
    filteredFeedbacks,
    hasActiveFilters,
    toggleFilter,
    clearAllFilters,
    setFilter,
    isFilterActive,
  };
}
