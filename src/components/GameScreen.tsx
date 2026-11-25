import React, { useState, useEffect, useRef } from 'react';
import { GameSettings, Question, UserAnswerResult, DIFFICULTIES, NumberTypeId } from '../types/game';
import { audioPlayer } from '../utils/audioPlayer';
import { getLanguage } from '../languages';
import { FeedbackCard } from './FeedbackCard';
import { Volume2, Send, AlertCircle } from 'lucide-react';

/** Normalizes numeric answers so 9-12 and 09-12 (or 9 and 09) compare equal. */
function normalizeAnswer(value: string, numberType: NumberTypeId): string {
  const cleaned = value.trim().replace(/\s+/g, '');

  // Phone numbers keep leading zeroes (090...) but may be typed with dashes.
  if (numberType === 'phone') {
    return cleaned.replace(/-/g, '').toLowerCase();
  }

  return cleaned
    .replace(/[\/.]/g, '-')
    .split('-')
    .map((part) => (/^\d+$/.test(part) ? String(Number(part)) : part.toLowerCase()))
    .join('-');
}

interface GameScreenProps {
  settings: GameSettings;
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswerSubmitted: (result: UserAnswerResult) => void;
  onNextQuestion: () => void;
  onQuit: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  settings,
  question,
  questionIndex,
  totalQuestions,
  onAnswerSubmitted,
  onNextQuestion,
  onQuit,
}) => {
  const [userInput, setUserInput] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentResult, setCurrentResult] = useState<UserAnswerResult | null>(null);
  const [replaysCount, setReplaysCount] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const diffConfig = DIFFICULTIES[settings.difficulty];
  const lang = getLanguage(settings.language);

  // Play audio for current question using active voice and speed
  const playAudio = (speedMultiplier: number = 1.0) => {
    setIsPlayingAudio(true);
    audioPlayer.playTokens(
      question.audioTokens,
      diffConfig.speed * speedMultiplier,
      settings.language,
      settings.voice,
      () => {
        setIsPlayingAudio(false);
      }
    );
  };

  useEffect(() => {
    setUserInput('');
    setCurrentResult(null);
    setReplaysCount(0);
    startTimeRef.current = Date.now();

    if (inputRef.current) {
      inputRef.current.focus();
    }

    playAudio(1.0);

    return () => {
      audioPlayer.stop();
    };
  }, [question.id, settings.language, settings.voice]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        setReplaysCount((c) => c + 1);
        playAudio(1.0);
      }
      if (e.code === 'Enter' && currentResult !== null) {
        e.preventDefault();
        onNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentResult, question.audioTokens, diffConfig.speed, settings.voice]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentResult !== null) return;

    const cleanInput = normalizeAnswer(userInput, settings.numberType);
    const cleanExpected = normalizeAnswer(question.expectedAnswer, settings.numberType);

    const isCorrect = cleanInput === cleanExpected;
    const timeSpentSec = (Date.now() - startTimeRef.current) / 1000;

    const result: UserAnswerResult = {
      question,
      userAnswer: userInput.trim(),
      isCorrect,
      timeSpentSec,
      replaysUsed: replaysCount,
    };

    setCurrentResult(result);
    onAnswerSubmitted(result);
  };

  const handleManualReplay = () => {
    setReplaysCount((c) => c + 1);
    playAudio(1.0);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-stone-200">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded bg-stone-800 text-amber-400 font-medium">
            {diffConfig.name} ({diffConfig.speed}x)
          </span>
        </div>

        <button
          type="button"
          onClick={onQuit}
          className="text-stone-400 hover:text-stone-200 transition-colors"
        >
          Quit practice
        </button>
      </div>

      <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-300"
          style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="bg-stone-800/60 border border-stone-700/60 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <button
            type="button"
            onClick={handleManualReplay}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isPlayingAudio
                ? 'bg-red-500 text-white shadow-xl shadow-red-500/50 scale-105 animate-pulse'
                : 'bg-stone-700/80 hover:bg-stone-700 text-stone-200 shadow-lg active:scale-95'
            }`}
            title="Click or press Space to replay"
          >
            <Volume2 className="w-10 h-10" />
          </button>

          <div className="flex items-center space-x-2 text-xs text-stone-400">
            <span>Replay audio:</span>
            <button
              type="button"
              onClick={handleManualReplay}
              className="px-2 py-1 rounded bg-stone-700/60 hover:bg-stone-700 text-stone-300 font-mono text-[11px]"
            >
              [Space]
            </button>
          </div>

          {diffConfig.visualClues ? (
            <div className="pt-2 text-center space-y-1">
              <span className="text-xs text-emerald-400 font-medium">{lang.uiText.visualAidLabel}</span>
              <div className="text-amber-400 text-sm font-medium">{question.pinyin}</div>
              <div className="chinese-font text-stone-200 text-2xl font-bold">{question.hanzi}</div>
            </div>
          ) : (
            <div className="pt-2 text-center">
              <span className="text-xs text-stone-400/80 flex items-center justify-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang.uiText.audioOnlyLabel}</span>
              </span>
            </div>
          )}
        </div>

        {currentResult === null ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-stone-400 block">
                {settings.numberType === 'phone'
                  ? 'Type phone digits (e.g. 138...)'
                  : settings.numberType === 'date'
                  ? 'Type date (e.g. 05-18 or 2024-05-18)'
                  : 'Type the number:'}
              </label>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={lang.uiText.inputPlaceholder}
                autoFocus
                className="w-full text-center font-mono font-bold text-3xl py-4 bg-stone-900 border-2 border-stone-700 focus:border-red-500 rounded-2xl text-stone-100 placeholder:text-stone-600 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={userInput.trim().length === 0}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base flex items-center justify-center space-x-2 shadow-lg shadow-red-950/40 transition-all active:scale-[0.99]"
            >
              <span>Submit Answer [Enter]</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <FeedbackCard result={currentResult} uiText={lang.uiText} onNext={onNextQuestion} />
        )}
      </div>
    </div>
  );
};
