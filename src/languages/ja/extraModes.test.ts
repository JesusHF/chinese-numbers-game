import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateJapanesePhoneQuestion } from './phoneMode';
import { generateJapaneseDateQuestion } from './dateMode';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Japanese phoneMode', () => {
  it('generates a 090 number with digit-by-digit audio and "no" pauses', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const q = generateJapanesePhoneQuestion('mobile');
    expect(q.displayLabel).toBe('090-0000-0000');
    expect(q.expectedAnswer).toBe('09000000000');
    expect(q.audioTokens).toEqual([
      '0', '9', '0', 'no', { pause: 200 },
      '0', '0', '0', '0', 'no', { pause: 200 },
      '0', '0', '0', '0',
    ]);
    expect(q.hanzi).toContain('の');
    expect(q.pinyin).toContain('no');
    expect(q.audioTokens).not.toContain('yao');
  });

  it('can omit の between number groups while keeping the pause', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const q = generateJapanesePhoneQuestion('mobile', false);
    expect(q.audioTokens).not.toContain('no');
    expect(q.audioTokens.filter((token) => typeof token === 'object')).toHaveLength(2);
    expect(q.hanzi).not.toContain('の');
    expect(q.pinyin).not.toContain('no');
  });

  it('uses yon, nana, and kyū instead of shi, shichi, and kuu', () => {
    const cases = [
      { random: 0.45, kana: 'よん', romaji: 'yon' },
      { random: 0.75, kana: 'なな', romaji: 'nana' },
      { random: 0.95, kana: 'きゅう', romaji: 'kyū' },
    ];

    for (const { random, kana, romaji } of cases) {
      vi.spyOn(Math, 'random').mockReturnValue(random);
      const q = generateJapanesePhoneQuestion('mobile');
      expect(q.hanzi).toContain(kana);
      expect(q.pinyin).toContain(romaji);
      vi.restoreAllMocks();
    }
  });
});

describe('Japanese dateMode', () => {
  it('uses しがつ and ついたち for April 1st', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.3) // month 4
      .mockReturnValueOnce(0); // day 1

    const q = generateJapaneseDateQuestion(false);
    expect(q.displayLabel).toBe('4月1日');
    expect(q.expectedAnswer).toBe('04-01');
    expect(q.audioTokens).toContain('4_shi');
    expect(q.audioTokens).toContain('gatsu');
    expect(q.audioTokens).toContain('tsuitachi');
  });

  it('uses native readings such as はつか for the 20th', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0) // month 1
      .mockReturnValueOnce(19 / 31); // day 20

    const q = generateJapaneseDateQuestion(false);
    expect(q.displayLabel).toBe('1月20日');
    expect(q.audioTokens).toContain('hatsuka');
  });

  it('reads years digit by digit before the month', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0) // month 1
      .mockReturnValueOnce(0) // day 1
      .mockReturnValueOnce(0); // year 1980

    const q = generateJapaneseDateQuestion(true);
    expect(q.expectedAnswer).toBe('1980-01-01');
    expect(q.audioTokens.slice(0, 5)).toEqual(['1', '9', '8', '0', 'nen']);
  });
});
