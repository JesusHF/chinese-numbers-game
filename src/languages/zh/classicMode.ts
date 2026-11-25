import { Question } from '../../types/game';

const DIGIT_HANZI: Record<number, string> = {
  0: '零', 1: '一', 2: '二', 3: '三', 4: '四',
  5: '五', 6: '六', 7: '七', 8: '八', 9: '九'
};

const DIGIT_PINYIN: Record<number, string> = {
  0: 'líng', 1: 'yī', 2: 'èr', 3: 'sān', 4: 'sì',
  5: 'wǔ', 6: 'liù', 7: 'qī', 8: 'bā', 9: 'jiǔ'
};

/**
 * Converts a 4-digit block (0-9999) into Chinese tokens and characters.
 * Handles the special rule for '两' before 百 and 千, and tens rule '十' vs '一十'.
 */
function convertSection(num: number, isHighestSection: boolean): { tokens: string[]; hanzi: string[]; pinyin: string[] } {
  const tokens: string[] = [];
  const hanzi: string[] = [];
  const pinyin: string[] = [];

  const thousands = Math.floor(num / 1000);
  const hundreds = Math.floor((num % 1000) / 100);
  const tens = Math.floor((num % 100) / 10);
  const units = num % 10;

  let hasZero = false;

  // Thousands
  if (thousands > 0) {
    const twoToken = thousands === 2 ? '2_liang' : String(thousands);
    const twoHanzi = thousands === 2 ? '两' : DIGIT_HANZI[thousands];
    const twoPinyin = thousands === 2 ? 'liǎng' : DIGIT_PINYIN[thousands];

    tokens.push(twoToken, '1000');
    hanzi.push(twoHanzi, '千');
    pinyin.push(twoPinyin, 'qiān');
    hasZero = false;
  }

  // Hundreds
  if (hundreds > 0) {
    if (thousands > 0 && hasZero) {
      tokens.push('0');
      hanzi.push('零');
      pinyin.push('líng');
      hasZero = false;
    }
    const twoToken = hundreds === 2 ? '2_liang' : String(hundreds);
    const twoHanzi = hundreds === 2 ? '两' : DIGIT_HANZI[hundreds];
    const twoPinyin = hundreds === 2 ? 'liǎng' : DIGIT_PINYIN[hundreds];

    tokens.push(twoToken, '100');
    hanzi.push(twoHanzi, '百');
    pinyin.push(twoPinyin, 'bǎi');
  } else if (thousands > 0 && (tens > 0 || units > 0)) {
    hasZero = true;
  }

  // Tens
  if (tens > 0) {
    if (hasZero) {
      tokens.push('0');
      hanzi.push('零');
      pinyin.push('líng');
      hasZero = false;
    }
    // Starting tens rule: 10-19 at the very start of a number is just '十' (shí), not '一十'
    if (tens === 1 && thousands === 0 && hundreds === 0 && isHighestSection) {
      tokens.push('10');
      hanzi.push('十');
      pinyin.push('shí');
    } else {
      tokens.push(String(tens), '10');
      hanzi.push(DIGIT_HANZI[tens], '十');
      pinyin.push(DIGIT_PINYIN[tens], 'shí');
    }
  } else if ((thousands > 0 || hundreds > 0) && units > 0) {
    hasZero = true;
  }

  // Units
  if (units > 0) {
    if (hasZero) {
      tokens.push('0');
      hanzi.push('零');
      pinyin.push('líng');
      hasZero = false;
    }
    tokens.push(String(units));
    hanzi.push(DIGIT_HANZI[units]);
    pinyin.push(DIGIT_PINYIN[units]);
  }

  return { tokens, hanzi, pinyin };
}

/**
 * Converts any non-negative integer (up to 9,999,999,999) into:
 * - audio token array
 * - hanzi string
 * - tone-marked pinyin string
 * - structural explanation breakdown
 */
export function convertClassicNumber(num: number): Question {
  if (num === 0) {
    return {
      id: 'classic-0',
      expectedAnswer: '0',
      displayLabel: '0',
      audioTokens: ['0'],
      hanzi: '零',
      pinyin: 'líng',
      breakdown: '0 (零 líng)',
    };
  }

  const yi = Math.floor(num / 100000000); // 亿 (10^8)
  const remainderYi = num % 100000000;
  const wan = Math.floor(remainderYi / 10000); // 万 (10^4)
  const remainderWan = remainderYi % 10000; // 个 (10^0)

  const tokens: string[] = [];
  const hanzi: string[] = [];
  const pinyin: string[] = [];
  const breakdownParts: string[] = [];

  let isFirst = true;

  // 1. 亿 (100,000,000s)
  if (yi > 0) {
    const sec = convertSection(yi, isFirst);
    tokens.push(...sec.tokens, '100000000');
    hanzi.push(...sec.hanzi, '亿');
    pinyin.push(...sec.pinyin, 'yì');
    breakdownParts.push(`${sec.hanzi.join('')}亿 (${yi}00,000,000)`);
    isFirst = false;
  }

  // 2. 万 (10,000s)
  if (wan > 0) {
    if (yi > 0 && wan < 1000) {
      tokens.push('0');
      hanzi.push('零');
      pinyin.push('líng');
    }
    const sec = convertSection(wan, isFirst);
    tokens.push(...sec.tokens, '10000');
    hanzi.push(...sec.hanzi, '万');
    pinyin.push(...sec.pinyin, 'wàn');
    breakdownParts.push(`${sec.hanzi.join('')}万 (${wan}0,000)`);
    isFirst = false;
  } else if (yi > 0 && remainderWan > 0) {
    tokens.push('0');
    hanzi.push('零');
    pinyin.push('líng');
  }

  // 3. Units / Remainder (1s)
  if (remainderWan > 0) {
    if ((yi > 0 || wan > 0) && remainderWan < 1000 && hanzi[hanzi.length - 1] !== '零') {
      tokens.push('0');
      hanzi.push('零');
      pinyin.push('líng');
    }
    const sec = convertSection(remainderWan, isFirst);
    tokens.push(...sec.tokens);
    hanzi.push(...sec.hanzi);
    pinyin.push(...sec.pinyin);
    breakdownParts.push(`${sec.hanzi.join('')} (${remainderWan})`);
  }

  return {
    id: `classic-${num}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    expectedAnswer: String(num),
    displayLabel: num.toLocaleString(),
    audioTokens: tokens,
    hanzi: hanzi.join(''),
    pinyin: pinyin.join(' '),
    breakdown: breakdownParts.join(' + ') || String(num),
  };
}

export function generateClassicQuestion(min: number, max: number): Question {
  const range = Math.max(0, max - min + 1);
  const randomNum = min + Math.floor(Math.random() * range);
  return convertClassicNumber(randomNum);
}
