import { LanguageDefinition } from '../../types/language';
import { GameSettings, Question } from '../../types/game';
import { generateClassicQuestion } from './classicMode';
import { generatePhoneQuestion } from './phoneMode';
import { generateDateQuestion } from './dateMode';

export const chineseLanguage: LanguageDefinition = {
  id: 'zh',
  name: 'Chinese',
  nativeName: '中文',
  flag: '🇨🇳',
  defaultVoice: 'xiaoxiao',
  voices: {
    xiaoxiao: {
      id: 'xiaoxiao',
      name: 'Xiaoxiao',
      gender: 'Female',
      avatar: '👩',
    },
    yunxi: {
      id: 'yunxi',
      name: 'Yunxi',
      gender: 'Male',
      avatar: '👨',
    },
  },
  uiText: {
    title: 'Chinese Numbers Game',
    badge: '中文听力',
    subtitle: 'Master Mandarin numbers, phone codes & dates by ear',
    typeHint: 'Extensible Practice Modes',
    visualAidLabel: 'Easy mode visual aid:',
    audioOnlyLabel: 'Strict Audio-Only • Listen closely and type the number',
    inputPlaceholder: '例如 523',
    correctLabel: 'Correct! 很好！',
    incorrectLabel: 'Incorrect',
  },
  generateQuestion: generateChineseQuestion,
};

export function generateChineseQuestion(settings: GameSettings): Question {
  switch (settings.numberType) {
    case 'classic':
      return generateClassicQuestion(settings.range.min, settings.range.max);
    case 'phone': {
      const category = settings.difficulty === 'easy' ? 'short' : settings.difficulty === 'medium' ? 'landline' : 'mobile';
      return generatePhoneQuestion(category);
    }
    case 'date':
      return generateDateQuestion(settings.dateOptions.includeYears);
    default:
      return generateClassicQuestion(settings.range.min, settings.range.max);
  }
}
