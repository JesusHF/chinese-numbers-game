import { describe, it, expect, vi } from 'vitest';
import { generateQuestion, getLanguage, LANGUAGES } from './index';
import { GameSettings } from '../types/game';

const baseSettings: GameSettings = {
  language: 'zh',
  numberType: 'classic',
  difficulty: 'easy',
  voice: 'xiaoxiao',
  range: { min: 0, max: 99 },
  dateOptions: { includeYears: false },
  totalQuestions: 1,
};

describe('language registry', () => {
  it('registers Chinese and Japanese with their own voices and generators', () => {
    expect(Object.keys(LANGUAGES)).toEqual(['zh', 'ja']);
    expect(Object.keys(getLanguage('zh').voices)).toEqual(['xiaoxiao', 'yunxi']);
    expect(Object.keys(getLanguage('ja').voices)).toEqual(['nanami', 'keita']);
  });

  it('delegates question generation to the active language', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const zhQuestion = generateQuestion(baseSettings);
    expect(zhQuestion.hanzi).toBe('零');

    const jaQuestion = generateQuestion({
      ...baseSettings,
      language: 'ja',
      voice: 'nanami',
    });
    expect(jaQuestion.hanzi).toContain('ゼロ');
    expect(getLanguage('ja').generateQuestion(baseSettings).id).toContain('ja-');

    vi.restoreAllMocks();
  });
});
