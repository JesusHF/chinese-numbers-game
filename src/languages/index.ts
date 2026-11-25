import { LanguageId, LanguageDefinition } from '../types/language';
import { GameSettings, Question } from '../types/game';
import { chineseLanguage } from './zh';
import { japaneseLanguage } from './ja';

export const LANGUAGES: Record<LanguageId, LanguageDefinition> = {
  zh: chineseLanguage,
  ja: japaneseLanguage,
};

export function getLanguage(id: LanguageId): LanguageDefinition {
  return LANGUAGES[id];
}

export function generateQuestion(settings: GameSettings): Question {
  return getLanguage(settings.language).generateQuestion(settings);
}
