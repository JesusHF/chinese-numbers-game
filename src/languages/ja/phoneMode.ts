import { Question } from '../../types/game';

const JA_PHONE_DIGIT_KANA: Record<string, string> = {
  '0': 'ゼロ', '1': 'いち', '2': 'に', '3': 'さん', '4': 'よん',
  '5': 'ご', '6': 'ろく', '7': 'なな', '8': 'はち', '9': 'きゅう',
};

const JA_PHONE_DIGIT_ROMAJI: Record<string, string> = {
  '0': 'zero', '1': 'ichi', '2': 'ni', '3': 'san', '4': 'yon',
  '5': 'go', '6': 'roku', '7': 'nana', '8': 'hachi', '9': 'kyū',
};

const JA_PHONE_DIGIT_AUDIO: Record<string, string> = {
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
  '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
};

export function generateJapanesePhoneQuestion(
  lengthCategory: 'short' | 'landline' | 'mobile' = 'mobile',
  includeNo: boolean = true
): Question {
  let chunks: string[] = [];

  if (lengthCategory === 'short') {
    const len = Math.random() < 0.5 ? 3 : 4;
    let num = '';
    for (let i = 0; i < len; i++) num += Math.floor(Math.random() * 10).toString();
    chunks = [num];
  } else if (lengthCategory === 'landline') {
    // Japanese landline: area code (2-5 digits) + local (4-6 digits), total ~10
    // Simplified: 03-XXXX-XXXX or 06-XXXX-XXXX
    const prefixes = ['03', '06', '011', '045', '052', '075'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    let chunk2 = '';
    for (let i = 0; i < 4; i++) chunk2 += Math.floor(Math.random() * 10).toString();
    let chunk3 = '';
    for (let i = 0; i < 4; i++) chunk3 += Math.floor(Math.random() * 10).toString();
    chunks = [prefix, chunk2, chunk3];
  } else {
    // Japanese mobile: 090/080/070-XXXX-XXXX
    const prefixes = ['090', '080', '070'];
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
  const kanaList: string[] = [];
  const romajiList: string[] = [];

  chunks.forEach((chunk, chunkIdx) => {
    for (const char of chunk) {
      audioTokens.push(JA_PHONE_DIGIT_AUDIO[char]);
      kanaList.push(JA_PHONE_DIGIT_KANA[char]);
      romajiList.push(JA_PHONE_DIGIT_ROMAJI[char]);
    }
    if (chunkIdx < chunks.length - 1) {
      if (includeNo) {
        audioTokens.push('no');
        kanaList.push('の');
        romajiList.push('no');
      }
      audioTokens.push({ pause: 200 });
    }
  });

  return {
    id: `ja-phone-${rawNumber}-${Date.now()}`,
    expectedAnswer: rawNumber,
    displayLabel,
    audioTokens,
    hanzi: kanaList.join(''),
    pinyin: romajiList.join(' '),
    breakdown: `Phone number: ${displayLabel} (digit-by-digit)`,
  };
}
