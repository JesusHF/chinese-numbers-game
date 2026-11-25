import type { GameSettings, Question } from './game';

export type LanguageId = 'zh' | 'ja';

export interface VoiceConfig {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  avatar: string;
}

export interface LanguageUIText {
  title: string;
  badge: string;
  subtitle: string;
  typeHint: string;
  visualAidLabel: string;
  audioOnlyLabel: string;
  inputPlaceholder: string;
  correctLabel: string;
  incorrectLabel: string;
}

export interface LanguageDefinition {
  id: LanguageId;
  name: string;
  nativeName: string;
  flag: string;
  defaultVoice: string;
  voices: Record<string, VoiceConfig>;
  uiText: LanguageUIText;
  generateQuestion: (settings: GameSettings) => Question;
}
