import React from 'react';
import { UserAnswerResult, DIFFICULTIES, GameSettings } from '../types/game';
import { audioPlayer } from '../utils/audioPlayer';
import { Trophy, RotateCcw, Volume2, CheckCircle2, XCircle, Sliders } from 'lucide-react';

interface ResultsScreenProps {
  settings: GameSettings;
  results: UserAnswerResult[];
  onPlayAgain: () => void;
  onChangeSettings: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  settings,
  results,
  onPlayAgain,
  onChangeSettings,
}) => {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const accuracyPct = Math.round((correctCount / Math.max(1, results.length)) * 100);
  const diffConfig = DIFFICULTIES[settings.difficulty];

  const handleReplayResult = (res: UserAnswerResult) => {
    audioPlayer.playTokens(res.question.audioTokens, diffConfig.speed);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Summary Score Card */}
      <div className="bg-stone-800/60 border border-stone-700/60 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center shadow-xl shadow-amber-950/40">
          <Trophy className="w-10 h-10 text-white" />
        </div>

        <div>
          <h2 className="text-3xl font-black text-stone-100">Practice Completed!</h2>
          <p className="text-sm text-stone-400 mt-1">
            {diffConfig.name} ({diffConfig.speed}x speed) • {settings.numberType.toUpperCase()}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4">
            <div className="text-3xl font-extrabold text-amber-400">{accuracyPct}%</div>
            <div className="text-xs text-stone-400 mt-1">Accuracy</div>
          </div>
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4">
            <div className="text-3xl font-extrabold text-emerald-400">
              {correctCount} / {results.length}
            </div>
            <div className="text-xs text-stone-400 mt-1">Correct</div>
          </div>
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4">
            <div className="text-3xl font-extrabold text-red-400">
              {results.length - correctCount}
            </div>
            <div className="text-xs text-stone-400 mt-1">Missed</div>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm flex items-center space-x-2 shadow-lg shadow-red-950/40 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Again</span>
          </button>
          <button
            type="button"
            onClick={onChangeSettings}
            className="px-6 py-3.5 rounded-xl bg-stone-700/80 hover:bg-stone-700 text-stone-200 font-bold text-sm flex items-center space-x-2 transition-all active:scale-95"
          >
            <Sliders className="w-4 h-4" />
            <span>Change Settings</span>
          </button>
        </div>
      </div>

      {/* Review List */}
      <div className="bg-stone-800/60 border border-stone-700/60 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-stone-300">Question Review ({results.length} questions)</h3>

        <div className="divide-y divide-stone-800">
          {results.map((res) => (
            <div key={res.question.id} className="py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {res.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-stone-100">{res.question.displayLabel}</span>
                    <span className="text-xs text-amber-400 font-medium">({res.question.pinyin})</span>
                    <span className="chinese-font text-xs text-stone-300">[{res.question.hanzi}]</span>
                  </div>
                  {!res.isCorrect && (
                    <div className="text-xs text-red-400">
                      You typed: <span className="font-mono">{res.userAnswer || '(none)'}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleReplayResult(res)}
                className="p-2 rounded-lg bg-stone-900 border border-stone-700 hover:border-stone-500 text-stone-300 transition-colors"
                title="Replay audio"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
