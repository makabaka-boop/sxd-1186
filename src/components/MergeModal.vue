<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, Merge, Layers } from 'lucide-vue-next';
import type { Feedback } from '../types/feedback';

const props = defineProps<{
  visible: boolean;
  selectedFeedbacks: Feedback[];
}>();

const emit = defineEmits<{
  close: [];
  confirm: [title: string];
}>();

const mergeTitle = ref('');

watch(
  () => props.visible,
  (val) => {
    if (val && props.selectedFeedbacks.length > 0) {
      const first = props.selectedFeedbacks[0];
      mergeTitle.value = `${first.snackName} - ${first.batch} 综合反馈`;
    }
  }
);

function handleConfirm() {
  if (!mergeTitle.value.trim()) {
    alert('请输入合并项标题');
    return;
  }
  emit('confirm', mergeTitle.value.trim());
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

      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div class="flex items-center justify-between px-6 py-4 border-b border-tea-100 bg-gradient-to-r from-tea-50 to-transparent">
          <h2 class="text-xl font-semibold text-tea-800 font-serif flex items-center gap-2">
            <Merge class="w-5 h-5 text-tea-500" />
            合并反馈
          </h2>
          <button
            @click="handleClose"
            class="p-1.5 rounded-lg text-tea-400 hover:bg-tea-100 hover:text-tea-600 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="px-6 py-5">
          <div class="mb-4">
            <p class="text-sm text-tea-600 mb-3">
              将 <span class="font-semibold text-tea-800">{{ selectedFeedbacks.length }}</span> 条反馈合并为一个处理项
            </p>

            <div class="max-h-48 overflow-y-auto space-y-2 bg-tea-50 rounded-lg p-3">
              <div
                v-for="feedback in selectedFeedbacks"
                :key="feedback.id"
                class="flex items-center gap-2 text-sm bg-white rounded-lg px-3 py-2 border border-tea-100"
              >
                <Layers class="w-4 h-4 text-tea-400 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-tea-800 truncate">{{ feedback.snackName }}</div>
                  <div class="text-xs text-tea-500 truncate">
                    {{ feedback.feedbackPerson }} · {{ feedback.suggestion || '无建议' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-tea-700 mb-1.5">合并项标题</label>
            <input
              v-model="mergeTitle"
              type="text"
              class="input-field"
              placeholder="请输入合并处理项的标题"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-tea-100 bg-tea-50/50">
          <button @click="handleClose" class="btn-secondary">取消</button>
          <button @click="handleConfirm" class="btn-primary flex items-center gap-2">
            <Merge class="w-4 h-4" />
            确认合并
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
