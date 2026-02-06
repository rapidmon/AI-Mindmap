import { AIProvider, AIResult, MindMap } from '../../models/types';
import { callClaude } from './claudeClient';
import { callOpenAI } from './openaiClient';
import { buildSynthesisPrompt } from './promptBuilder';

export async function synthesize(
  provider: AIProvider,
  apiKey: string,
  mindMap: MindMap,
): Promise<AIResult[]> {
  const prompt = buildSynthesisPrompt(mindMap);

  switch (provider) {
    case 'claude':
      return callClaude(apiKey, prompt);
    case 'openai':
      return callOpenAI(apiKey, prompt);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
