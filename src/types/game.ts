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
    speed: 0.7,
    visualClues: true,
    description: '0.7x speed • Hanzi & Pinyin guides visible',
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

export interface AudioTokenSequence {
  // Array of token keys (e.g. ['5', '100', '2', '10', '3']) or silence pauses { pause: number } in ms
  items: (string | { pause: number })[];
}

export interface Question {
  id: string;
  // What the user is expected to type (digits only or formatted string)
  expectedAnswer: string;
  // Display string after answer reveal (e.g. "523", "138-1234-5678", "2024年10月1号")
  displayLabel: string;
  // Audio playback token list
  audioTokens: (string | { pause: number })[];
  // Chinese Hanzi string (e.g. "五百二十三")
  hanzi: string;
  // Tone-marked Pinyin (e.g. "wǔ bǎi èr shí sān")
  pinyin: string;
  // Place value or breakdown explanation
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
  numberType: NumberTypeId;
  difficulty: DifficultyId;
  range: NumberRange;
  // Specific options for types (e.g., dates)
  dateOptions: {
    includeYears: boolean;
  };
  totalQuestions: number;
}
