export interface Party {
  id: number;
  party_name: string;
  short_name: string;
  color: string;
  symbol: string;
}

export interface Topic {
  id: string;
  label: string;
  emoji: string;
}

export interface PolicyComparison {
  party_name: string;
  short_name: string;
  color: string;
  symbol: string;
  content: string;
}

export interface PartyAnswer {
  party: string;
  short_name: string;
  answer: string;
}

export interface AIResponse {
  summary: string;
  party_answers: PartyAnswer[];
  disclaimer: string;
}

export type ActiveTab = 'ask' | 'compare';
