import { LanguageDefinition } from '../../types/language';
import { GameSettings, Question } from '../../types/game';
import { generateJapaneseClassicQuestion } from './classicMode';
import { generateJapanesePhoneQuestion } from './phoneMode';
import { generateJapaneseDateQuestion } from './dateMode';

export const japaneseLanguage: LanguageDefinition = {
  id: 'ja',
  name: 'Japanese',
  nativeName: '日本語',
  flag: '🇯🇵',
  defaultVoice: 'nanami',
  voices: {
    nanami: {
      id: 'nanami',
      name: 'Nanami',
      gender: 'Female',
      avatar: '👩',
    },
    keita: {
      id: 'keita',
      name: 'Keita',
      gender: 'Male',
      avatar: '👨',
    },
  },
  uiText: {
    title: 'Japanese Numbers Game',
    badge: '日本語聴解',
    subtitle: 'Master Japanese numbers, phone codes & dates by ear',
    typeHint: 'Extensible Practice Modes',
    visualAidLabel: 'Easy mode visual aid:',
    audioOnlyLabel: 'Strict Audio-Only • Listen closely and type the number',
    inputPlaceholder: '例: 523',
    correctLabel: '正解！',
    incorrectLabel: '不正解',
  },
  generateQuestion: generateJapaneseQuestion,
};

export function generateJapaneseQuestion(settings: GameSettings): Question {
  switch (settings.numberType) {
    case 'classic':
      return generateJapaneseClassicQuestion(settings.range.min, settings.range.max);
    case 'phone': {
      const category = settings.difficulty === 'easy' ? 'short' : settings.difficulty === 'medium' ? 'landline' : 'mobile';
      return generateJapanesePhoneQuestion(category);
    }
    case 'date':
      return generateJapaneseDateQuestion(settings.dateOptions.includeYears);
    default:
      return generateJapaneseClassicQuestion(settings.range.min, settings.range.max);
  }
}
