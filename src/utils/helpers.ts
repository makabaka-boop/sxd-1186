export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

export function getDueStatus(dueDate?: string, status?: string): 'normal' | 'upcoming' | 'overdue' | 'no_due' {
  if (!dueDate) return 'no_due';
  if (status === 'resolved' || status === 'merged') return 'normal';

  const now = new Date();
  const due = new Date(dueDate);
  const dueEndOfDay = new Date(due);
  dueEndOfDay.setHours(23, 59, 59, 999);

  const diffMs = dueEndOfDay.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffMs < 0) return 'overdue';
  if (diffDays <= 3) return 'upcoming';
  return 'normal';
}

export function getDaysRemaining(dueDate?: string): number | null {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const dueEndOfDay = new Date(due);
  dueEndOfDay.setHours(23, 59, 59, 999);
  const diffMs = dueEndOfDay.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function toDateInputValue(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function textSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  const s1 = text1.toLowerCase().trim();
  const s2 = text2.toLowerCase().trim();
  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;

  const set1 = new Set<string>();
  const set2 = new Set<string>();

  for (let i = 0; i < s1.length - 1; i++) {
    set1.add(s1.substr(i, 2));
  }
  for (let i = 0; i < s2.length - 1; i++) {
    set2.add(s2.substr(i, 2));
  }

  let intersection = 0;
  set1.forEach((item) => {
    if (set2.has(item)) intersection++;
  });

  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
