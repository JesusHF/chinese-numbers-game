import { Question } from '../../types/game';

const DIGIT_HANZI: Record<number, string> = {
  0: '零', 1: '一', 2: '二', 3: '三', 4: '四',
  5: '五', 6: '六', 7: '七', 8: '八', 9: '九'
};

const DIGIT_PINYIN: Record<number, string> = {
  0: 'líng', 1: 'yī', 2: 'èr', 3: 'sān', 4: 'sì',
  5: 'wǔ', 6: 'liù', 7: 'qī', 8: 'bā', 9: 'jiǔ'
};

// Converts small positional number (1-31) for months and days
function convertSmallPositional(n: number): { tokens: string[]; hanzi: string[]; pinyin: string[] } {
  const tokens: string[] = [];
  const hanzi: string[] = [];
  const pinyin: string[] = [];

  if (n < 10) {
    tokens.push(String(n));
    hanzi.push(DIGIT_HANZI[n]);
    pinyin.push(DIGIT_PINYIN[n]);
  } else if (n === 10) {
    tokens.push('10');
    hanzi.push('十');
    pinyin.push('shí');
  } else if (n < 20) {
    const unit = n % 10;
    tokens.push('10', String(unit));
    hanzi.push('十', DIGIT_HANZI[unit]);
    pinyin.push('shí', DIGIT_PINYIN[unit]);
  } else {
    const tens = Math.floor(n / 10);
    const unit = n % 10;
    tokens.push(String(tens), '10');
    hanzi.push(DIGIT_HANZI[tens], '十');
    pinyin.push(DIGIT_PINYIN[tens], 'shí');
    if (unit > 0) {
      tokens.push(String(unit));
      hanzi.push(DIGIT_HANZI[unit]);
      pinyin.push(DIGIT_PINYIN[unit]);
    }
  }

  return { tokens, hanzi, pinyin };
}

export function generateDateQuestion(includeYears: boolean = false): Question {
  const month = Math.floor(Math.random() * 12) + 1; // 1-12
  
  // Max days in month
  let maxDays = 31;
  if ([4, 6, 9, 11].includes(month)) maxDays = 30;
  if (month === 2) maxDays = 28;
  const day = Math.floor(Math.random() * maxDays) + 1; // 1-maxDays

  const year = includeYears ? Math.floor(Math.random() * 50) + 1980 : null; // 1980 - 2030

  const audioTokens: (string | { pause: number })[] = [];
  const hanziParts: string[] = [];
  const pinyinParts: string[] = [];

  let expectedAnswer = '';
  let displayLabel = '';

  // 1. Year (spoken digit by digit + 年 nián)
  if (year !== null) {
    const yearStr = String(year);
    for (const ch of yearStr) {
      audioTokens.push(ch);
      hanziParts.push(DIGIT_HANZI[Number(ch)]);
      pinyinParts.push(DIGIT_PINYIN[Number(ch)]);
    }
    audioTokens.push('nian', { pause: 150 });
    hanziParts.push('年 ');
    pinyinParts.push('nián');

    expectedAnswer += `${yearStr}-`;
    displayLabel += `${yearStr}年`;
  }

  // 2. Month (positional + 月 yuè)
  const mConv = convertSmallPositional(month);
  audioTokens.push(...mConv.tokens, 'yue', { pause: 150 });
  hanziParts.push(...mConv.hanzi, '月 ');
  pinyinParts.push(...mConv.pinyin, 'yuè');

  const monthPadded = month < 10 ? `0${month}` : String(month);
  expectedAnswer += `${monthPadded}-`;
  displayLabel += `${month}月`;

  // 3. Day (positional + 号 hào)
  const dConv = convertSmallPositional(day);
  audioTokens.push(...dConv.tokens, 'hao');
  hanziParts.push(...dConv.hanzi, '号');
  pinyinParts.push(...dConv.pinyin, 'hào');

  const dayPadded = day < 10 ? `0${day}` : String(day);
  expectedAnswer += dayPadded;
  displayLabel += `${day}号`;

  return {
    id: `date-${expectedAnswer}-${Date.now()}`,
    expectedAnswer, // format: "YYYY-MM-DD" or "MM-DD"
    displayLabel,
    audioTokens,
    hanzi: hanziParts.join(''),
    pinyin: pinyinParts.join(' '),
    breakdown: year !== null
      ? `Year (digit by digit) + Month + Day: ${year}年 ${month}月 ${day}号`
      : `Month + Day: ${month}月 ${day}号`,
  };
}
