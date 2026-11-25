import { describe, it, expect } from 'vitest';
import { convertJapaneseClassicNumber } from './classicMode';

describe('convertJapaneseClassicNumber', () => {
  it('converts 0 with the zero token', () => {
    const q = convertJapaneseClassicNumber(0);
    expect(q.expectedAnswer).toBe('0');
    expect(q.audioTokens).toEqual(['0']);
    expect(q.hanzi).toContain('零');
  });

  it('applies rendaku sound shifts for hundreds', () => {
    expect(convertJapaneseClassicNumber(300).audioTokens).toEqual(['300']);
    expect(convertJapaneseClassicNumber(300).pinyin).toContain('sanbyaku');
    expect(convertJapaneseClassicNumber(600).pinyin).toContain('roppyaku');
    expect(convertJapaneseClassicNumber(800).pinyin).toContain('happyaku');
  });

  it('applies rendaku sound shifts for thousands', () => {
    expect(convertJapaneseClassicNumber(3000).audioTokens).toEqual(['3000']);
    expect(convertJapaneseClassicNumber(3000).pinyin).toContain('sanzen');
    expect(convertJapaneseClassicNumber(8000).audioTokens).toEqual(['8000']);
    expect(convertJapaneseClassicNumber(8000).pinyin).toContain('hassen');
  });

  it('uses ichiman / ichioku for 万 and 億', () => {
    expect(convertJapaneseClassicNumber(10000).audioTokens).toEqual(['1', '10000']);
    expect(convertJapaneseClassicNumber(10000).pinyin).toContain('ichi man');
    expect(convertJapaneseClassicNumber(100000000).audioTokens).toEqual(['1', '100000000']);
    expect(convertJapaneseClassicNumber(100000000).pinyin).toContain('ichi oku');
  });

  it('composes mixed four-digit numbers', () => {
    const q = convertJapaneseClassicNumber(12345);
    expect(q.audioTokens).toEqual(['1', '10000', '2', '1000', '300', '4', '10', '5']);
    expect(q.hanzi).toBe('一万二千三百四十五');
  });
});
