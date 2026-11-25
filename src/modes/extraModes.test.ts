import { describe, it, expect } from 'vitest';
import { generatePhoneQuestion } from './phoneMode';
import { generateDateQuestion } from './dateMode';

describe('phoneMode', () => {
  it('generates short service numbers (3-4 digits)', () => {
    const q = generatePhoneQuestion('short');
    expect(q.expectedAnswer.length).toBeGreaterThanOrEqual(3);
    expect(q.expectedAnswer.length).toBeLessThanOrEqual(4);
    expect(q.audioTokens.length).toBeGreaterThan(0);
  });

  it('replaces 1 with yao in audio and pinyin', () => {
    // Generate phone numbers until we find one with digit '1'
    let found = false;
    for (let i = 0; i < 20; i++) {
      const q = generatePhoneQuestion('mobile');
      if (q.expectedAnswer.includes('1')) {
        expect(q.audioTokens).toContain('yao');
        expect(q.hanzi).toContain('幺');
        expect(q.pinyin).toContain('yāo');
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('generates 11-digit mobile numbers with 3-4-4 chunking', () => {
    const q = generatePhoneQuestion('mobile');
    expect(q.expectedAnswer.length).toBe(11);
    expect(q.displayLabel).toMatch(/^\d{3}-\d{4}-\d{4}$/);
  });
});

describe('dateMode', () => {
  it('generates month and day without year by default', () => {
    const q = generateDateQuestion(false);
    expect(q.displayLabel).toMatch(/^\d{1,2}月\d{1,2}号$/);
    expect(q.audioTokens).toContain('yue');
    expect(q.audioTokens).toContain('hao');
    expect(q.audioTokens).not.toContain('nian');
  });

  it('generates year, month, and day when includeYears is true', () => {
    const q = generateDateQuestion(true);
    expect(q.displayLabel).toMatch(/^\d{4}年\d{1,2}月\d{1,2}号$/);
    expect(q.audioTokens).toContain('nian');
    expect(q.audioTokens).toContain('yue');
    expect(q.audioTokens).toContain('hao');
  });
});
