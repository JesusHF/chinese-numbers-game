import React from 'react';
import { UserAnswerResult } from '../types/game';
import { LanguageUIText } from '../types/language';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface FeedbackCardProps {
  result: UserAnswerResult;
  uiText: LanguageUIText;
  onNext: () => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ result, uiText, onNext }) => {
  const { question, userAnswer, isCorrect } = result;

  return (
    <div
      className={`rounded-2xl border p-6 space-y-5 shadow-2xl transition-all ${
        isCorrect
          ? 'bg-emerald-950/30 border-emerald-500/60 shadow-emerald-950/30'
          : 'bg-red-950/30 border-red-500/60 shadow-red-950/30'
      }`}
    >
      {/* Status banner */}
      <div className="flex items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center space-x-3">
          {isCorrect ? (
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <XCircle className="w-6 h-6" />
            </div>
          )}
          <h3 className="font-bold text-lg text-stone-100">
            {isCorrect ? uiText.correctLabel : uiText.incorrectLabel}
          </h3>
        </div>

        <button
          type="button"
          onClick={onNext}
          autoFocus
          className="shrink-0 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-white text-stone-900 font-bold text-sm flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
        >
          <span>Next [Enter]</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Answer comparison + native text / phonetic reading breakdown */}
      <div className="bg-stone-900/80 rounded-xl p-5 border border-stone-800 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-stone-400">
          <span>
            You typed:{' '}
            <span className={`font-mono break-all ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
              {userAnswer || '(empty)'}
            </span>
          </span>
          {!isCorrect && (
            <>
              <span aria-hidden="true">•</span>
              <span>
                Expected:{' '}
                <span className="font-mono break-all text-emerald-300">{question.expectedAnswer}</span>
              </span>
            </>
          )}
        </div>

        <div className="text-center space-y-1">
          <div className="text-amber-400 text-sm font-medium tracking-wide">
            {question.pinyin}
          </div>
          <div className="chinese-font text-stone-100 text-3xl font-bold tracking-wider">
            {question.hanzi}
          </div>
        </div>

        {question.breakdown && (
          <div className="pt-3 border-t border-stone-800 text-center text-xs text-stone-400">
            <span className="text-stone-300 font-medium">Breakdown: </span>
            <span>{question.breakdown}</span>
          </div>
        )}
      </div>
    </div>
  );
};
