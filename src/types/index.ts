import type { Timestamp } from 'firebase/firestore';

export interface Card {
  id: string; // Or could be an index if not stored separately
  question: string;
  answer: string;
}

export interface CardSet {
  id: string;
  name: string;
  userId: string;
  cards: Card[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  language?: string; // For AI generated sets
  aiGenerated?: boolean;
}

export interface UserSettings {
  geminiApiKey?: string;
}
