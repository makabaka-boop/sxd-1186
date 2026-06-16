<script setup lang="ts">
import { ref } from 'vue';
import {
  AlertTriangle,
  AlertCircle,
  Layers,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-vue-next';
import type { SmartAlert, AlertType } from '../types/feedback';

const props = defineProps<{
  alerts: SmartAlert[];
}>();

const emit = defineEmits<{
  focusAlert: [alert: SmartAlert];
  dismiss: [alertId: string];
}>();

const expandedAlerts = ref<Set<string>>(new Set());

function toggleExpand(alertId: string) {
  if (expandedAlerts.value.has(alertId)) {
    expandedAlerts.value.delete(alertId);
  } else {
    expandedAlerts.value.add(alertId);
  }
}

function getAlertIcon(type: AlertType) {
  switch (type) {
    case 'negative_batch':
      return AlertTriangle;
    case 'missing_fields':
      return AlertCircle;
    case 'duplicate_suggestion':
      return Layers;
    case 'high_priority_pending':
      return Clock;
    default:
      return AlertCircle;
  }
}

function getAlertColor(type: AlertType) {
  switch (type) {
    case 'negative_batch':
      return {
        bg: 'bg-caramel-50',
        border: 'border-caramel-200',
        text: 'text-caramel-700',
        icon: 'text-caramel-500',
      };
    case 'missing_fields':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: 'text-amber-500',
      };
    case 'duplicate_suggestion':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: 'text-blue-500',
      };
    case 'high_priority_pending':
      return {
        bg: 'bg-tea-50',
        border: 'border-tea-200',
        text: 'text-tea-700',
        icon: 'text-tea-500',
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        icon: 'text-gray-500',
      };
  }
}

function handleFocus(alert: SmartAlert) {
  emit('focusAlert', alert);
}

function handleDismiss(e: Event, alertId: string) {
  e.stopPropagation();
  emit('dismiss', alertId);
}
</script>

<template>
  <div v-if="alerts.length > 0" class="space-y-2 mb-5">
    <h3 class="text-sm font-semibold text-tea-700 flex items-center gap-2">
      <AlertTriangle class="w-4 h-4 text-caramel-500" />
      智能提醒 ({{ alerts.length }})
    </h3>
    <div class="space-y-2">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="rounded-lg border overflow-hidden cursor-pointer transition-all hover:shadow-md animate-fade-in-up"
        :class="[getAlertColor(alert.type).bg, getAlertColor(alert.type).border]"
        @click="handleFocus(alert)"
      >
        <div class="flex items-start gap-3 p-3">
          <component
            :is="getAlertIcon(alert.type)"
            class="w-5 h-5 flex-shrink-0 mt-0.5"
            :class="getAlertColor(alert.type).icon"
          />
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm" :class="getAlertColor(alert.type).text">
              {{ alert.title }}
            </div>
            <p class="text-xs mt-0.5 opacity-80" :class="getAlertColor(alert.type).text">
              {{ alert.description }}
            </p>
            <div
              v-if="expandedAlerts.has(alert.id)"
              class="mt-2 pt-2 border-t border-white/50"
            >
              <span class="text-xs opacity-70" :class="getAlertColor(alert.type).text">
                相关反馈：{{ alert.relatedFeedbackIds.length }} 条
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click.stop="toggleExpand(alert.id)"
              class="p-1 rounded hover:bg-white/50 transition-colors"
              :class="getAlertColor(alert.type).text"
            >
              <ChevronDown v-if="!expandedAlerts.has(alert.id)" class="w-4 h-4" />
              <ChevronUp v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
