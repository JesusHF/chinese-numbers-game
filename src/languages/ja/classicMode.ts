import { Question } from '../../types/game';

const JA_DIGIT_KANJI: Record<number, string> = {
  0: '零', 1: '一', 2: '二', 3: '三', 4: '四',
  5: '五', 6: '六', 7: '七', 8: '八', 9: '九'
};

const JA_DIGIT_KANA: Record<number, string> = {
  0: 'ゼロ', 1: 'いち', 2: 'に', 3: 'さん', 4: 'よん',
  5: 'ご', 6: 'ろく', 7: 'なな', 8: 'はち', 9: 'きゅう'
};

const JA_DIGIT_ROMAJI: Record<number, string> = {
  0: 'zero', 1: 'ichi', 2: 'ni', 3: 'san', 4: 'yon',
  5: 'go', 6: 'roku', 7: 'nana', 8: 'hachi', 9: 'kyū'
};

/**
 * Converts a 4-digit block (0-9999) in Japanese:
 * Handles sound shifts (Rendaku):
 * - Hundreds: 300 (sanbyaku), 600 (roppyaku), 800 (happyaku)
 * - Thousands: 3000 (sanzen), 8000 (hassen)
 */
function convertJapaneseSection(num: number): {
  tokens: string[];
  kanji: string[];
  kana: string[];
  romaji: string[];
} {
  const tokens: string[] = [];
  const kanji: string[] = [];
  const kana: string[] = [];
  const romaji: string[] = [];

  const thousands = Math.floor(num / 1000);
  const hundreds = Math.floor((num % 1000) / 100);
  const tens = Math.floor((num % 100) / 10);
  const units = num % 10;

  // Thousands
  if (thousands > 0) {
    if (thousands === 1) {
      tokens.push('1000');
      kanji.push('千');
      kana.push('せん');
      romaji.push('sen');
    } else if (thousands === 3) {
      tokens.push('3000');
      kanji.push('三千');
      kana.push('さんぜん');
      romaji.push('sanzen');
    } else if (thousands === 8) {
      tokens.push('8000');
      kanji.push('八千');
      kana.push('はっせん');
      romaji.push('hassen');
    } else {
      tokens.push(String(thousands), '1000');
      kanji.push(JA_DIGIT_KANJI[thousands], '千');
      kana.push(JA_DIGIT_KANA[thousands], 'せん');
      romaji.push(`${JA_DIGIT_ROMAJI[thousands]}sen`);
    }
  }

  // Hundreds
  if (hundreds > 0) {
    if (hundreds === 1) {
      tokens.push('100');
      kanji.push('百');
      kana.push('ひゃく');
      romaji.push('hyaku');
    } else if (hundreds === 3) {
      tokens.push('300');
      kanji.push('三百');
      kana.push('さんびゃく');
      romaji.push('sanbyaku');
    } else if (hundreds === 6) {
      tokens.push('600');
      kanji.push('六百');
      kana.push('ろっぴゃく');
      romaji.push('roppyaku');
    } else if (hundreds === 8) {
      tokens.push('800');
      kanji.push('八百');
      kana.push('はっぴゃく');
      romaji.push('happyaku');
    } else {
      tokens.push(String(hundreds), '100');
      kanji.push(JA_DIGIT_KANJI[hundreds], '百');
      kana.push(JA_DIGIT_KANA[hundreds], 'ひゃく');
      romaji.push(`${JA_DIGIT_ROMAJI[hundreds]}hyaku`);
    }
  }

  // Tens
  if (tens > 0) {
    if (tens === 1) {
      tokens.push('10');
      kanji.push('十');
      kana.push('じゅう');
      romaji.push('jū');
    } else {
      tokens.push(String(tens), '10');
      kanji.push(JA_DIGIT_KANJI[tens], '十');
      kana.push(JA_DIGIT_KANA[tens], 'じゅう');
      romaji.push(`${JA_DIGIT_ROMAJI[tens]}jū`);
    }
  }

  // Units
  if (units > 0) {
    tokens.push(String(units));
    kanji.push(JA_DIGIT_KANJI[units]);
    kana.push(JA_DIGIT_KANA[units]);
    romaji.push(JA_DIGIT_ROMAJI[units]);
  }

  return { tokens, kanji, kana, romaji };
}

export function convertJapaneseClassicNumber(num: number): Question {
  if (num === 0) {
    return {
      id: `ja-classic-0-${Date.now()}`,
      expectedAnswer: '0',
      displayLabel: '0',
      audioTokens: ['0'],
      hanzi: '零 (ゼロ)',
      pinyin: 'zero',
      breakdown: '0 (ゼロ zero)',
    };
  }

  const oku = Math.floor(num / 100000000); // 億 (10^8)
  const remainderOku = num % 100000000;
  const man = Math.floor(remainderOku / 10000); // 万 (10^4)
  const remainderMan = remainderOku % 10000;

  const tokens: string[] = [];
  const kanji: string[] = [];
  const kana: string[] = [];
  const romaji: string[] = [];
  const breakdownParts: string[] = [];

  // 1. 億 (oku)
  if (oku > 0) {
    const sec = convertJapaneseSection(oku);
    tokens.push(...sec.tokens, '100000000');
    kanji.push(...sec.kanji, '億');
    kana.push(...sec.kana, 'おく');
    romaji.push(...sec.romaji, 'oku');
    breakdownParts.push(`${sec.kanji.join('')}億 (${oku}00,000,000)`);
  }

  // 2. 万 (man) - in Japanese 10,000 is always '一万' (ichiman)
  if (man > 0) {
    const sec = convertJapaneseSection(man);
    tokens.push(...sec.tokens, '10000');
    kanji.push(...sec.kanji, '万');
    kana.push(...sec.kana, 'まん');
    romaji.push(...sec.romaji, 'man');
    breakdownParts.push(`${sec.kanji.join('')}万 (${man}0,000)`);
  }

  // 3. Remainder
  if (remainderMan > 0) {
    const sec = convertJapaneseSection(remainderMan);
    tokens.push(...sec.tokens);
    kanji.push(...sec.kanji);
    kana.push(...sec.kana);
    romaji.push(...sec.romaji);
    breakdownParts.push(`${sec.kanji.join('')} (${remainderMan})`);
  }

  return {
    id: `ja-classic-${num}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    expectedAnswer: String(num),
    displayLabel: num.toLocaleString(),
    audioTokens: tokens,
    hanzi: kanji.join(''),
    pinyin: `${kana.join('')} (${romaji.join(' ')})`,
    breakdown: breakdownParts.join(' + ') || String(num),
  };
}

export function generateJapaneseClassicQuestion(min: number, max: number): Question {
  const range = Math.max(0, max - min + 1);
  const randomNum = min + Math.floor(Math.random() * range);
  return convertJapaneseClassicNumber(randomNum);
}
