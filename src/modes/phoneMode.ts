import { Question } from '../types/game';

const PHONE_DIGIT_HANZI: Record<string, string> = {
  '0': '零',
  '1': '幺', // Specially pronounced as yāo in phone numbers
  '2': '二',
  '3': '三',
  '4': '四',
  '5': '五',
  '6': '六',
  '7': '七',
  '8': '八',
  '9': '九',
};

const PHONE_DIGIT_PINYIN: Record<string, string> = {
  '0': 'líng',
  '1': 'yāo',
  '2': 'èr',
  '3': 'sān',
  '4': 'sì',
  '5': 'wǔ',
  '6': 'liù',
  '7': 'qī',
  '8': 'bā',
  '9': 'jiǔ',
};

const PHONE_DIGIT_AUDIO: Record<string, string> = {
  '0': '0',
  '1': 'yao',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
};

/**
 * Generates phone numbers with realistic formats:
 * - 3-4 digits: Emergency & service numbers (e.g., 110, 119, 120, 95588)
 * - 8 digits: Landline numbers (e.g., 8234-5678)
 * - 11 digits: Chinese mobile numbers (e.g., 138-1234-5678)
 */
export function generatePhoneQuestion(lengthCategory: 'short' | 'landline' | 'mobile' = 'mobile'): Question {
  let chunks: string[] = [];

  if (lengthCategory === 'short') {
    // 3 or 4 digits
    const len = Math.random() < 0.5 ? 3 : 4;
    let num = '';
    for (let i = 0; i < len; i++) {
      num += Math.floor(Math.random() * 10).toString();
    }
    chunks = [num];
  } else if (lengthCategory === 'landline') {
    // 8 digits: 4 - 4
    let chunk1 = (Math.floor(Math.random() * 8) + 2).toString(); // starts with 2-9
    for (let i = 0; i < 3; i++) chunk1 += Math.floor(Math.random() * 10).toString();
    let chunk2 = '';
    for (let i = 0; i < 4; i++) chunk2 += Math.floor(Math.random() * 10).toString();
    chunks = [chunk1, chunk2];
  } else {
    // Mobile: 11 digits (3 - 4 - 4), starts with 13x, 15x, 18x, 19x
    const prefixes = ['138', '139', '150', '158', '186', '188', '198'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    let chunk2 = '';
    for (let i = 0; i < 4; i++) chunk2 += Math.floor(Math.random() * 10).toString();
    let chunk3 = '';
    for (let i = 0; i < 4; i++) chunk3 += Math.floor(Math.random() * 10).toString();
    chunks = [prefix, chunk2, chunk3];
  }

  const rawNumber = chunks.join('');
  const displayLabel = chunks.join('-');

  const audioTokens: (string | { pause: number })[] = [];
  const hanziList: string[] = [];
  const pinyinList: string[] = [];

  chunks.forEach((chunk, chunkIdx) => {
    for (const char of chunk) {
      audioTokens.push(PHONE_DIGIT_AUDIO[char]);
      hanziList.push(PHONE_DIGIT_HANZI[char]);
      pinyinList.push(PHONE_DIGIT_PINYIN[char]);
    }
    // Add micro rhythmic pause (180ms) between number chunks
    if (chunkIdx < chunks.length - 1) {
      audioTokens.push({ pause: 180 });
      hanziList.push(' ');
      pinyinList.push('·');
    }
  });

  return {
    id: `phone-${rawNumber}-${Date.now()}`,
    expectedAnswer: rawNumber,
    displayLabel,
    audioTokens,
    hanzi: hanziList.join(''),
    pinyin: pinyinList.join(' '),
    breakdown: `Phone number: 1 is read as 幺 (yāo) • Chunked as ${displayLabel}`,
  };
}
