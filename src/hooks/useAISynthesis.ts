import { useState, useCallback } from 'react';
import { AIResult, MindMap } from '../models/types';
import { useSettingsStore } from '../store/useSettingsStore';
import { synthesize } from '../services/ai/aiService';

export function useAISynthesis() {
  const [results, setResults] = useState<AIResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provider = useSettingsStore((s) => s.provider);
  const claudeApiKey = useSettingsStore((s) => s.claudeApiKey);
  const openaiApiKey = useSettingsStore((s) => s.openaiApiKey);

  const generateIdeas = useCallback(
    async (mindMap: MindMap) => {
      setIsLoading(true);
      setError(null);

      const apiKey = provider === 'claude' ? claudeApiKey : openaiApiKey;
      if (!apiKey) {
        setError('API key not set. Go to Settings to configure.');
        setIsLoading(false);
        return;
      }

      try {
        const newResults = await synthesize(provider, apiKey, mindMap);
        setResults((prev) => [...newResults, ...prev]);
      } catch (e: any) {
        setError(e.message || 'AI synthesis failed');
      } finally {
        setIsLoading(false);
      }
    },
    [provider, claudeApiKey, openaiApiKey],
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, isLoading, error, generateIdeas, clearResults };
}
