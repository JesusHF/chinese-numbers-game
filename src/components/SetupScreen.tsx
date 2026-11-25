import React from 'react';
import {
  GameSettings,
  NumberTypeId,
  DifficultyId,
  DIFFICULTIES,
  RANGE_MIN_OPTIONS,
  RANGE_MAX_OPTIONS,
  DEFAULT_RANGES_BY_DIFFICULTY
} from '../types/game';
import { VoiceConfig } from '../types/language';
import { getLanguage } from '../languages';
import { audioPlayer } from '../utils/audioPlayer';
import { Hash, Phone, Calendar, Play, Eye, EyeOff, Volume2 } from 'lucide-react';

interface SetupScreenProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onStartGame: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  settings,
  onUpdateSettings,
  onStartGame,
}) => {
  const lang = getLanguage(settings.language);
  const voices = lang.voices;

  const handleTypeSelect = (type: NumberTypeId) => {
    onUpdateSettings({ ...settings, numberType: type });
  };

  const handleDifficultySelect = (diff: DifficultyId) => {
    const defaultRange = DEFAULT_RANGES_BY_DIFFICULTY[diff];
    onUpdateSettings({
      ...settings,
      difficulty: diff,
      range: defaultRange,
    });
  };

  const handleVoiceToggle = (voiceId: string) => {
    onUpdateSettings({ ...settings, voice: voiceId });
    // Play a preview sound (e.g. '8')
    audioPlayer.playTokens(['8'], 1.0, settings.language, voiceId);
  };

  const handleMinChange = (minVal: number) => {
    let newMax = settings.range.max;
    if (minVal > newMax) {
      const validMax = RANGE_MAX_OPTIONS.find((v) => v >= minVal) || RANGE_MAX_OPTIONS[RANGE_MAX_OPTIONS.length - 1];
      newMax = validMax;
    }
    onUpdateSettings({
      ...settings,
      range: { min: minVal, max: newMax },
    });
  };

  const handleMaxChange = (maxVal: number) => {
    let newMin = settings.range.min;
    if (maxVal < newMin) {
      const validMins = [...RANGE_MIN_OPTIONS].reverse();
      newMin = validMins.find((v) => v <= maxVal) || 0;
    }
    onUpdateSettings({
      ...settings,
      range: { min: newMin, max: maxVal },
    });
  };

  // Language-specific mode descriptions
  const modeDescriptions = {
    classic: settings.language === 'ja'
      ? 'Standard positional values (百, 千, 万, 億) across any chosen range.'
      : 'Standard positional values (百, 千, 万, 亿) across any chosen range.',
    phone: settings.language === 'ja'
      ? 'Digit-by-digit cadence for Japanese phone numbers (090, 080, 070).'
      : <>Digit-by-digit cadence where 1 is spoken as <strong className="text-amber-300">yāo (幺)</strong>.</>,
    date: settings.language === 'ja'
      ? 'Japanese dates with native day readings (ついたち, ふつか, みっか...).'
      : 'Months (月) & days (号), with optional year (年) prefix.',
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* 1. Difficulty Section (Speed & Visual Aid) + Compact Voice Switch Toggle */}
      <div className="bg-stone-800/60 border border-stone-700/60 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-stone-200 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">1</span>
            <span>Difficulty (Speed & Visual Aid)</span>
          </h2>

          {/* Compact Voice Switch Toggle */}
          <div className="flex items-center space-x-2 bg-stone-900/90 border border-stone-700/70 p-1 rounded-xl">
            <span className="text-[11px] text-stone-400 pl-1.5 pr-0.5 font-medium flex items-center space-x-1">
              <Volume2 className="w-3 h-3 text-amber-400" />
              <span>Voice:</span>
            </span>
            {Object.keys(voices).map((vId) => {
              const voice: VoiceConfig = voices[vId];
              const isSelected = settings.voice === vId;
              return (
                <button
                  key={vId}
                  type="button"
                  onClick={() => handleVoiceToggle(vId)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-sm font-semibold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                  title={`Switch to ${voice.name} (${voice.gender}) natural voice`}
                >
                  <span>{voice.avatar}</span>
                  <span>{voice.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(Object.keys(DIFFICULTIES) as DifficultyId[]).map((diffId) => {
            const conf = DIFFICULTIES[diffId];
            const isSelected = settings.difficulty === diffId;
            return (
              <button
                key={diffId}
                type="button"
                onClick={() => handleDifficultySelect(diffId)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-950/30 border-amber-500 shadow-md shadow-amber-950/20'
                    : 'bg-stone-900/60 border-stone-700/50 hover:border-stone-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-stone-100">{conf.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-stone-800 text-amber-300 border border-stone-700">
                    {conf.speed}x speed
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-stone-400">
                  {conf.visualClues ? (
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visual {settings.language === 'ja' ? 'Kanji & Kana' : 'Hanzi & Pinyin'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-amber-400 font-medium">
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Strict Audio-Only</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Number Type Section */}
      <div className="bg-stone-800/60 border border-stone-700/60 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-200 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">2</span>
            <span>Select Number Type</span>
          </h2>
          <span className="text-xs text-stone-400">{lang.uiText.typeHint}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Classic */}
          <button
            type="button"
            onClick={() => handleTypeSelect('classic')}
            className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
              settings.numberType === 'classic'
                ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950/30'
                : 'bg-stone-900/60 border-stone-700/50 hover:border-stone-600'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2 rounded-lg ${settings.numberType === 'classic' ? 'bg-red-500 text-white' : 'bg-stone-800 text-stone-400'}`}>
                <Hash className="w-5 h-5" />
              </div>
              <span className="font-semibold text-stone-100">Classic Numbers</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {modeDescriptions.classic}
            </p>
          </button>

          {/* Phone */}
          <button
            type="button"
            onClick={() => handleTypeSelect('phone')}
            className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
              settings.numberType === 'phone'
                ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950/30'
                : 'bg-stone-900/60 border-stone-700/50 hover:border-stone-600'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2 rounded-lg ${settings.numberType === 'phone' ? 'bg-red-500 text-white' : 'bg-stone-800 text-stone-400'}`}>
                <Phone className="w-5 h-5" />
              </div>
              <span className="font-semibold text-stone-100">Phone Numbers</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {modeDescriptions.phone}
            </p>
          </button>

          {/* Dates */}
          <button
            type="button"
            onClick={() => handleTypeSelect('date')}
            className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
              settings.numberType === 'date'
                ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950/30'
                : 'bg-stone-900/60 border-stone-700/50 hover:border-stone-600'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2 rounded-lg ${settings.numberType === 'date' ? 'bg-red-500 text-white' : 'bg-stone-800 text-stone-400'}`}>
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-semibold text-stone-100">Dates</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {modeDescriptions.date}
            </p>
          </button>
        </div>

        {/* Date options conditional toggle */}
        {settings.numberType === 'date' && (
          <div className="mt-3 p-3 bg-stone-900/80 rounded-xl border border-stone-700/50 flex items-center justify-between">
            <span className="text-xs text-stone-300">
              Include Years in dates (e.g. 2024年)?
            </span>
            <label className="flex items-center cursor-pointer space-x-2">
              <input
                type="checkbox"
                checked={settings.dateOptions.includeYears}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    dateOptions: { includeYears: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-stone-600 bg-stone-800"
              />
              <span className="text-xs font-medium text-stone-300">Include Years</span>
            </label>
          </div>
        )}

        {/* Japanese-only phone separator toggle */}
        {settings.language === 'ja' && settings.numberType === 'phone' && (
          <div className="mt-3 p-3 bg-stone-900/80 rounded-xl border border-stone-700/50 flex items-center justify-between">
            <span className="text-xs text-stone-300">
              Say 「の」 between number groups?
            </span>
            <label className="flex items-center cursor-pointer space-x-2">
              <input
                type="checkbox"
                checked={settings.phoneOptions.includeNo}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    phoneOptions: { includeNo: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-stone-600 bg-stone-800"
              />
              <span className="text-xs font-medium text-stone-300">Include 「の」</span>
            </label>
          </div>
        )}
      </div>

      {/* 3. Number Range Section */}
      {settings.numberType === 'classic' && (
        <div className="bg-stone-800/60 border border-stone-700/60 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-200 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">3</span>
              <span>Number Range</span>
            </h2>
            <span className="text-xs text-amber-400/90 font-mono">
              Current: {settings.range.min.toLocaleString()} → {settings.range.max.toLocaleString()}
            </span>
          </div>

          <p className="text-xs text-stone-400">
            Study any number bracket. Defaults are tailored per difficulty level, but can be fully customized:
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-300">From (Minimum)</label>
              <select
                value={settings.range.min}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
              >
                {RANGE_MIN_OPTIONS.map((val) => (
                  <option key={val} value={val}>
                    {val.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-300">To (Maximum)</label>
              <select
                value={settings.range.max}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
              >
                {RANGE_MAX_OPTIONS.map((val) => (
                  <option key={val} value={val} disabled={val < settings.range.min}>
                    {val.toLocaleString()} {val < settings.range.min ? '(Below Min)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Start Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onStartGame}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-base flex items-center justify-center space-x-2 shadow-xl shadow-red-950/50 transition-all active:scale-[0.99]"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Start Practice</span>
        </button>
      </div>
    </div>
  );
};
