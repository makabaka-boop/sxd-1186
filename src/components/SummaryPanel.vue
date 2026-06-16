<script setup lang="ts">
import { Clock, AlertTriangle, TrendingUp, BarChart3, Flame } from 'lucide-vue-next';
import type { BatchScore, FrequentIssue } from '../types/feedback';
import { SWEETNESS_LABELS } from '../types/feedback';

defineProps<{
  pendingCount: number;
  processingCount: number;
  resolvedCount: number;
  batchScores: BatchScore[];
  frequentIssues: FrequentIssue[];
}>();

const emit = defineEmits<{
  focusIssue: [feedbackIds: string[]];
}>();

function getSweetnessColor(score: number): string {
  if (score <= 2) return 'text-caramel-500';
  if (score >= 4) return 'text-amber-500';
  return 'text-matcha-500';
}

function getSweetnessBg(score: number): string {
  if (score <= 2) return 'from-caramel-400 to-caramel-500';
  if (score >= 4) return 'from-amber-400 to-amber-500';
  return 'from-matcha-400 to-matcha-500';
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <h3 class="text-lg font-semibold text-tea-800 font-serif flex items-center gap-2 mb-3">
        <BarChart3 class="w-5 h-5 text-tea-500" />
        待处理反馈
      </h3>
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center border border-amber-100">
          <div class="text-3xl font-bold text-amber-600">{{ pendingCount }}</div>
          <div class="text-xs text-amber-600 mt-1">待处理</div>
        </div>
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-100">
          <div class="text-3xl font-bold text-blue-600">{{ processingCount }}</div>
          <div class="text-xs text-blue-600 mt-1">处理中</div>
        </div>
        <div class="bg-gradient-to-br from-matcha-50 to-matcha-100 rounded-xl p-4 text-center border border-matcha-100">
          <div class="text-3xl font-bold text-matcha-600">{{ resolvedCount }}</div>
          <div class="text-xs text-matcha-600 mt-1">已解决</div>
        </div>
      </div>
    </div>

    <div>
      <h3 class="text-lg font-semibold text-tea-800 font-serif flex items-center gap-2 mb-3">
        <Flame class="w-5 h-5 text-caramel-500" />
        高频问题
      </h3>
      <div class="card !p-4">
        <div v-if="frequentIssues.length === 0" class="text-center py-4 text-tea-400 text-sm">
          暂无高频问题数据
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="issue in frequentIssues"
            :key="issue.keyword"
            class="flex items-center gap-3 cursor-pointer hover:bg-tea-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
            @click="emit('focusIssue', issue.feedbackIds)"
          >
            <span class="flex-1 text-sm text-tea-700">{{ issue.keyword }}</span>
            <div class="flex items-center gap-2">
              <div class="w-20 h-2 bg-tea-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-tea-400 to-tea-500 rounded-full transition-all"
                  :style="{ width: `${Math.min(100, issue.count * 15)}%` }"
                ></div>
              </div>
              <span class="text-xs font-medium text-tea-600 w-6 text-right">{{ issue.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 class="text-lg font-semibold text-tea-800 font-serif flex items-center gap-2 mb-3">
        <TrendingUp class="w-5 h-5 text-matcha-500" />
        批次评分概览
      </h3>
      <div class="space-y-3">
        <div
          v-for="batch in batchScores"
          :key="batch.batch"
          class="card !p-4 hover:shadow-card-hover transition-shadow"
        >
          <div class="flex items-center justify-between mb-2">
            <div>
              <div class="font-medium text-tea-800 text-sm">{{ batch.snackName }}</div>
              <div class="text-xs text-tea-500">{{ batch.batch }}</div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold" :class="getSweetnessColor(batch.avgSweetness)">
                {{ batch.avgSweetness.toFixed(1) }}
              </div>
              <div class="text-xs text-tea-400">平均甜度</div>
            </div>
          </div>
          <div class="flex items-center gap-2 text-xs text-tea-500 mb-2">
            <span>{{ batch.feedbackCount }} 条反馈</span>
            <span v-if="batch.negativeCount > 0" class="text-caramel-500">
              · {{ batch.negativeCount }} 条负面
            </span>
          </div>
          <div class="w-full h-2 bg-tea-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all bg-gradient-to-r"
              :class="getSweetnessBg(batch.avgSweetness)"
              :style="{ width: `${(batch.avgSweetness / 5) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
