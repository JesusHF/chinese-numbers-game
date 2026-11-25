import { LanguageId } from './language';

export type NumberTypeId = 'classic' | 'phone' | 'date';

export type DifficultyId = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  id: DifficultyId;
  name: string;
  speed: number;
  visualClues: boolean;
  description: string;
}

export const DIFFICULTIES: Record<DifficultyId, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: 'Easy',
    speed: 0.9,
    visualClues: true,
    description: '0.9x speed • Visual guides visible',
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    speed: 1.0,
    visualClues: false,
    description: '1.0x speed • Strict audio-only (no visual clues)',
  },
  hard: {
    id: 'hard',
    name: 'Hard',
    speed: 1.2,
    visualClues: false,
    description: '1.2x speed • Fast audio-only (no visual clues)',
  },
};

export interface NumberRange {
  min: number;
  max: number;
}

export const RANGE_MIN_OPTIONS = [0, 10, 100, 1000, 10000, 1000000] as const;
export const RANGE_MAX_OPTIONS = [9, 99, 999, 9999, 99999, 9999999] as const;

export const DEFAULT_RANGES_BY_DIFFICULTY: Record<DifficultyId, NumberRange> = {
  easy: { min: 0, max: 99 },
  medium: { min: 10, max: 9999 },
  hard: { min: 10, max: 9999999 },
};

export interface Question {
  id: string;
  expectedAnswer: string;
  displayLabel: string;
  audioTokens: (string | { pause: number })[];
  hanzi: string; // Native text representation (Hanzi / Kanji / Kana)
  pinyin: string; // Phonetic reading (Pinyin / Furigana / Romaji)
  breakdown?: string;
}

export interface UserAnswerResult {
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
  timeSpentSec: number;
  replaysUsed: number;
}

export interface GameSettings {
  language: LanguageId;
  numberType: NumberTypeId;
  difficulty: DifficultyId;
  voice: string;
  range: NumberRange;
  dateOptions: {
    includeYears: boolean;
  };
  phoneOptions: {
    includeNo: boolean;
  };
  totalQuestions: number;
}
