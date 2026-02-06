import { create } from 'zustand';
import { AIProvider, AISettings } from '../models/types';
import {
  StorageKeys,
  loadFromStorage,
  debouncedSave,
} from '../services/storage/storageService';
import { STORAGE_DEBOUNCE_MS } from '../utils/constants';

interface SettingsStore extends AISettings {
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  setProvider: (provider: AIProvider) => void;
  setClaudeApiKey: (key: string) => void;
  setOpenaiApiKey: (key: string) => void;
}

function persistSettings(state: SettingsStore) {
  const { provider, claudeApiKey, openaiApiKey } = state;
  debouncedSave(StorageKeys.SETTINGS, { provider, claudeApiKey, openaiApiKey }, STORAGE_DEBOUNCE_MS);
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  provider: 'claude',
  claudeApiKey: '',
  openaiApiKey: '',
  isLoaded: false,

  loadSettings: async () => {
    const saved = await loadFromStorage<AISettings>(StorageKeys.SETTINGS);
    if (saved) {
      set({ ...saved, isLoaded: true });
    } else {
      set({ isLoaded: true });
    }
  },

  setProvider: (provider: AIProvider) => {
    set({ provider });
    persistSettings(get());
  },

  setClaudeApiKey: (key: string) => {
    set({ claudeApiKey: key });
    persistSettings(get());
  },

  setOpenaiApiKey: (key: string) => {
    set({ openaiApiKey: key });
    persistSettings(get());
  },
}));
