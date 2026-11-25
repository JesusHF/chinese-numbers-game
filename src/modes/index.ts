import { GameSettings, Question } from '../types/game';
import { generateClassicQuestion } from './classicMode';
import { generatePhoneQuestion } from './phoneMode';
import { generateDateQuestion } from './dateMode';

export function generateQuestion(settings: GameSettings): Question {
  switch (settings.numberType) {
    case 'classic':
      return generateClassicQuestion(settings.range.min, settings.range.max);
    case 'phone': {
      // Pick appropriate phone length based on difficulty or random
      const category = settings.difficulty === 'easy' ? 'short' : settings.difficulty === 'medium' ? 'landline' : 'mobile';
      return generatePhoneQuestion(category);
    }
    case 'date':
      return generateDateQuestion(settings.dateOptions.includeYears);
    default:
      return generateClassicQuestion(settings.range.min, settings.range.max);
  }
}
