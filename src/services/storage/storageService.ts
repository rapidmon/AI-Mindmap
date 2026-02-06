import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  MINDMAP: 'mindmap-storage',
  SETTINGS: 'settings-storage',
} as const;

export async function loadFromStorage<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
    return null;
  } catch {
    return null;
  }
}

export async function saveToStorage<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {
    // silently fail – storage not critical
  }
}

let debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export function debouncedSave<T>(key: string, data: T, ms: number): void {
  if (debounceTimers[key]) clearTimeout(debounceTimers[key]);
  debounceTimers[key] = setTimeout(() => {
    saveToStorage(key, data);
  }, ms);
}
