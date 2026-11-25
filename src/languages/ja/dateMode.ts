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

/** Japanese months (1–12) with sound shifts on 4月, 7月, 9月 */
const JA_MONTHS: Record<number, { kanji: string; kana: string; romaji: string; tokens: string[] }> = {
  1:  { kanji: '一月',   kana: 'いちがつ',       romaji: 'ichigatsu',   tokens: ['1', 'gatsu'] },
  2:  { kanji: '二月',   kana: 'にがつ',         romaji: 'nigatsu',     tokens: ['2', 'gatsu'] },
  3:  { kanji: '三月',   kana: 'さんがつ',       romaji: 'sangatsu',    tokens: ['3', 'gatsu'] },
  4:  { kanji: '四月',   kana: 'しがつ',         romaji: 'shigatsu',    tokens: ['4_shi', 'gatsu'] },
  5:  { kanji: '五月',   kana: 'ごがつ',         romaji: 'gogatsu',     tokens: ['5', 'gatsu'] },
  6:  { kanji: '六月',   kana: 'ろくがつ',       romaji: 'rokugatsu',   tokens: ['6', 'gatsu'] },
  7:  { kanji: '七月',   kana: 'しちがつ',       romaji: 'shichigatsu', tokens: ['7_shichi', 'gatsu'] },
  8:  { kanji: '八月',   kana: 'はちがつ',       romaji: 'hachigatsu',  tokens: ['8', 'gatsu'] },
  9:  { kanji: '九月',   kana: 'くがつ',         romaji: 'kugatsu',     tokens: ['9_ku', 'gatsu'] },
  10: { kanji: '十月',   kana: 'じゅうがつ',     romaji: 'jūgatsu',     tokens: ['10', 'gatsu'] },
  11: { kanji: '十一月', kana: 'じゅういちがつ', romaji: 'jūichigatsu', tokens: ['10', '1', 'gatsu'] },
  12: { kanji: '十二月', kana: 'じゅうにがつ',   romaji: 'jūnigatsu',   tokens: ['10', '2', 'gatsu'] },
};

/**
 * Japanese days of the month.
 * Many days have irregular native (和語 / wago) readings.
 * Days that follow the regular Sino-Japanese pattern use it.
 * For audio, irregular days use a single combined token (e.g. 'tsuitachi'),
 * while regular days compose digit + 'nichi'.
 */
const JA_DAYS: Record<number, { kanji: string; kana: string; romaji: string; tokens: string[] }> = {
  1:  { kanji: '一日',   kana: 'ついたち',           romaji: 'tsuitachi',   tokens: ['tsuitachi'] },
  2:  { kanji: '二日',   kana: 'ふつか',             romaji: 'futsuka',     tokens: ['futsuka'] },
  3:  { kanji: '三日',   kana: 'みっか',             romaji: 'mikka',       tokens: ['mikka'] },
  4:  { kanji: '四日',   kana: 'よっか',             romaji: 'yokka',       tokens: ['yokka'] },
  5:  { kanji: '五日',   kana: 'いつか',             romaji: 'itsuka',      tokens: ['itsuka'] },
  6:  { kanji: '六日',   kana: 'むいか',             romaji: 'muika',       tokens: ['muika'] },
  7:  { kanji: '七日',   kana: 'なのか',             romaji: 'nanoka',      tokens: ['nanoka'] },
  8:  { kanji: '八日',   kana: 'ようか',             romaji: 'yōka',        tokens: ['youka'] },
  9:  { kanji: '九日',   kana: 'ここのか',           romaji: 'kokonoka',    tokens: ['kokonoka'] },
  10: { kanji: '十日',   kana: 'とおか',             romaji: 'tōka',        tokens: ['tooka'] },
  11: { kanji: '十一日', kana: 'じゅういちにち',     romaji: 'jūichinichi', tokens: ['10', '1', 'nichi'] },
  12: { kanji: '十二日', kana: 'じゅうににち',       romaji: 'jūninichi',   tokens: ['10', '2', 'nichi'] },
  13: { kanji: '十三日', kana: 'じゅうさんにち',     romaji: 'jūsannichi',  tokens: ['10', '3', 'nichi'] },
  14: { kanji: '十四日', kana: 'じゅうよっか',       romaji: 'jūyokka',     tokens: ['10', 'yokka'] },
  15: { kanji: '十五日', kana: 'じゅうごにち',       romaji: 'jūgonichi',   tokens: ['10', '5', 'nichi'] },
  16: { kanji: '十六日', kana: 'じゅうろくにち',     romaji: 'jūrokunichi', tokens: ['10', '6', 'nichi'] },
  17: { kanji: '十七日', kana: 'じゅうしちにち',     romaji: 'jūshichinichi', tokens: ['10', '7_shichi', 'nichi'] },
  18: { kanji: '十八日', kana: 'じゅうはちにち',     romaji: 'jūhachinichi', tokens: ['10', '8', 'nichi'] },
  19: { kanji: '十九日', kana: 'じゅうくにち',       romaji: 'jūkunichi',   tokens: ['10', '9_ku', 'nichi'] },
  20: { kanji: '二十日', kana: 'はつか',             romaji: 'hatsuka',     tokens: ['hatsuka'] },
  21: { kanji: '二十一日', kana: 'にじゅういちにち', romaji: 'nijūichinichi', tokens: ['2', '10', '1', 'nichi'] },
  22: { kanji: '二十二日', kana: 'にじゅうににち',   romaji: 'nijūninichi', tokens: ['2', '10', '2', 'nichi'] },
  23: { kanji: '二十三日', kana: 'にじゅうさんにち', romaji: 'nijūsannichi', tokens: ['2', '10', '3', 'nichi'] },
  24: { kanji: '二十四日', kana: 'にじゅうよっか',   romaji: 'nijūyokka',   tokens: ['2', '10', 'yokka'] },
  25: { kanji: '二十五日', kana: 'にじゅうごにち',   romaji: 'nijūgonichi', tokens: ['2', '10', '5', 'nichi'] },
  26: { kanji: '二十六日', kana: 'にじゅうろくにち', romaji: 'nijūrokunichi', tokens: ['2', '10', '6', 'nichi'] },
  27: { kanji: '二十七日', kana: 'にじゅうしちにち', romaji: 'nijūshichinichi', tokens: ['2', '10', '7_shichi', 'nichi'] },
  28: { kanji: '二十八日', kana: 'にじゅうはちにち', romaji: 'nijūhachinichi', tokens: ['2', '10', '8', 'nichi'] },
  29: { kanji: '二十九日', kana: 'にじゅうくにち',   romaji: 'nijūkunichi', tokens: ['2', '10', '9_ku', 'nichi'] },
  30: { kanji: '三十日',   kana: 'さんじゅうにち',   romaji: 'sanjūnichi', tokens: ['3', '10', 'nichi'] },
  31: { kanji: '三十一日', kana: 'さんじゅういちにち', romaji: 'sanjūichinichi', tokens: ['3', '10', '1', 'nichi'] },
};

export function generateJapaneseDateQuestion(includeYears: boolean = false): Question {
  const month = Math.floor(Math.random() * 12) + 1; // 1-12

  // Max days in month
  let maxDays = 31;
  if ([4, 6, 9, 11].includes(month)) maxDays = 30;
  if (month === 2) maxDays = 28;
  const day = Math.floor(Math.random() * maxDays) + 1;

  const year = includeYears ? Math.floor(Math.random() * 50) + 1980 : null;

  const audioTokens: (string | { pause: number })[] = [];
  const kanjiParts: string[] = [];
  const kanaParts: string[] = [];
  const romajiParts: string[] = [];

  let expectedAnswer = '';
  let displayLabel = '';

  // 1. Year (spoken digit by digit + 年 nen)
  if (year !== null) {
    const yearStr = String(year);
    for (const ch of yearStr) {
      const d = Number(ch);
      audioTokens.push(ch);
      kanjiParts.push(JA_DIGIT_KANJI[d]);
      kanaParts.push(JA_DIGIT_KANA[d]);
      romajiParts.push(JA_DIGIT_ROMAJI[d]);
    }
    audioTokens.push('nen', { pause: 150 });
    kanjiParts.push('年 ');
    kanaParts.push('ねん ');
    romajiParts.push('nen');

    expectedAnswer += `${yearStr}-`;
    displayLabel += `${yearStr}年`;
  }

  // 2. Month
  const monthInfo = JA_MONTHS[month];
  audioTokens.push(...monthInfo.tokens, { pause: 150 });
  kanjiParts.push(monthInfo.kanji, ' ');
  kanaParts.push(monthInfo.kana, ' ');
  romajiParts.push(monthInfo.romaji);

  const monthPadded = month < 10 ? `0${month}` : String(month);
  expectedAnswer += `${monthPadded}-`;
  displayLabel += `${month}月`;

  // 3. Day
  const dayInfo = JA_DAYS[day];
  audioTokens.push(...dayInfo.tokens);
  kanjiParts.push(dayInfo.kanji);
  kanaParts.push(dayInfo.kana);
  romajiParts.push(dayInfo.romaji);

  const dayPadded = day < 10 ? `0${day}` : String(day);
  expectedAnswer += dayPadded;
  displayLabel += `${day}日`;

  return {
    id: `ja-date-${expectedAnswer}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    expectedAnswer,
    displayLabel,
    audioTokens,
    hanzi: kanjiParts.join(''),
    pinyin: `${kanaParts.join('')} (${romajiParts.join(' ')})`,
    breakdown: year !== null
      ? `Year + Month + Day: ${year}年 ${monthInfo.kanji} ${dayInfo.kanji}`
      : `Month + Day: ${monthInfo.kanji} ${dayInfo.kanji}`,
  };
}
