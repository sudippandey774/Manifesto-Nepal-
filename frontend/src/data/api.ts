import type { Party, Topic, PolicyComparison, AIResponse } from '../types';

const BASE = '/api';

export async function fetchParties(): Promise<Party[]> {
  const res = await fetch(`${BASE}/parties`);
  if (!res.ok) throw new Error('Failed to load parties');
  return res.json();
}

export async function fetchTopics(): Promise<Topic[]> {
  const res = await fetch(`${BASE}/topics`);
  if (!res.ok) throw new Error('Failed to load topics');
  return res.json();
}

export async function fetchComparison(topic: string): Promise<PolicyComparison[]> {
  const res = await fetch(`${BASE}/compare?topic=${encodeURIComponent(topic)}`);
  if (!res.ok) throw new Error('Failed to load comparison');
  return res.json();
}

export async function askAI(question: string): Promise<AIResponse> {
  const res = await fetch(`${BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'AI request failed');
  return data;
}
