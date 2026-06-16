import { ref, watch } from 'vue';

export function useStorage<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key);
  const data = ref<T>(stored ? JSON.parse(stored) : defaultValue);

  watch(
    data,
    (newVal) => {
      localStorage.setItem(key, JSON.stringify(newVal));
    },
    { deep: true }
  );

  function setData(newVal: T) {
    data.value = newVal;
  }

  function clearStorage() {
    localStorage.removeItem(key);
    data.value = defaultValue;
  }

  function exportData(): T {
    return JSON.parse(JSON.stringify(data.value));
  }

  function importData(importedData: T) {
    data.value = importedData;
  }

  return {
    data,
    setData,
    clearStorage,
    exportData,
    importData,
  };
}
