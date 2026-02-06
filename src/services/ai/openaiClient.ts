import { AIResult } from '../../models/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function callOpenAI(
  apiKey: string,
  prompt: string,
): Promise<AIResult[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '[]';

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Failed to parse AI response');

  const ideas = JSON.parse(jsonMatch[0]) as { idea: string; description: string }[];
  return ideas.map((item) => ({
    id: generateId(),
    idea: item.idea,
    description: item.description,
    timestamp: Date.now(),
  }));
}
