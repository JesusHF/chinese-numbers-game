import { describe, it, expect } from 'vitest';
import { convertClassicNumber } from './classicMode';

describe('convertClassicNumber', () => {
  it('converts 0 correctly', () => {
    const q = convertClassicNumber(0);
    expect(q.hanzi).toBe('零');
    expect(q.pinyin).toBe('líng');
    expect(q.audioTokens).toEqual(['0']);
  });

  it('converts single digits 1-9', () => {
    expect(convertClassicNumber(1).hanzi).toBe('一');
    expect(convertClassicNumber(8).hanzi).toBe('八');
    expect(convertClassicNumber(9).pinyin).toBe('jiǔ');
  });

  it('handles tens rule 10-19 starting with ten', () => {
    const q10 = convertClassicNumber(10);
    expect(q10.hanzi).toBe('十');
    expect(q10.audioTokens).toEqual(['10']);

    const q15 = convertClassicNumber(15);
    expect(q15.hanzi).toBe('十五');
    expect(q15.audioTokens).toEqual(['10', '5']);
  });

  it('handles regular tens 20-99', () => {
    const q24 = convertClassicNumber(24);
    expect(q24.hanzi).toBe('二十四');
    expect(q24.audioTokens).toEqual(['2', '10', '4']);

    const q60 = convertClassicNumber(60);
    expect(q60.hanzi).toBe('六十');
    expect(q60.audioTokens).toEqual(['6', '10']);
  });

  it('handles hundreds and internal zero (105, 230)', () => {
    const q105 = convertClassicNumber(105);
    expect(q105.hanzi).toBe('一百零五');
    expect(q105.audioTokens).toEqual(['1', '100', '0', '5']);

    const q230 = convertClassicNumber(230);
    expect(q230.hanzi).toBe('两百三十');
    expect(q230.audioTokens).toEqual(['2_liang', '100', '3', '10']);
  });

  it('handles 6-digit numbers with 万 (120000, 305400, 456789)', () => {
    const q120k = convertClassicNumber(120000);
    expect(q120k.hanzi).toBe('十二万');
    expect(q120k.audioTokens).toEqual(['10', '2', '10000']);

    const q456789 = convertClassicNumber(456789);
    expect(q456789.hanzi).toBe('四十五万六千七百八十九');
    expect(q456789.audioTokens).toEqual([
      '4', '10', '5', '10000',
      '6', '1000', '7', '100', '8', '10', '9'
    ]);
  });

  it('handles 9-digit numbers with 亿', () => {
    const q100m = convertClassicNumber(100000000);
    expect(q100m.hanzi).toBe('一亿');
    expect(q100m.audioTokens).toEqual(['1', '100000000']);
  });
});
