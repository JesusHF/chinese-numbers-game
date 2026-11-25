import React from 'react';
import { Volume2 } from 'lucide-react';
import { GameSettings } from '../types/game';
import { LanguageId } from '../types/language';
import { LANGUAGES, getLanguage } from '../languages';

interface HeaderProps {
  settings: GameSettings;
  onLanguageChange: (langId: LanguageId) => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, onLanguageChange }) => {
  const lang = getLanguage(settings.language);

  // Dynamic accent colors per language
  const accentFrom = settings.language === 'ja' ? 'from-rose-600' : 'from-red-600';
  const accentTo = settings.language === 'ja' ? 'to-pink-500' : 'to-amber-500';
  const badgeBg = settings.language === 'ja' ? 'bg-rose-950' : 'bg-red-950';
  const badgeText = settings.language === 'ja' ? 'text-rose-300' : 'text-red-300';
  const badgeBorder = settings.language === 'ja' ? 'border-rose-800/60' : 'border-red-800/60';

  return (
    <header className="border-b border-stone-800 bg-stone-900/80 backdrop-blur sticky top-0 z-50 py-4 px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${accentFrom} ${accentTo} flex items-center justify-center shadow-lg shadow-red-950/40`}>
            <span className="chinese-font text-white font-black text-xl">数</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-stone-100 flex items-center space-x-2">
              <span>{lang.uiText.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${badgeBg} ${badgeText} border ${badgeBorder} font-normal`}>
                {lang.uiText.badge}
              </span>
            </h1>
            <p className="text-xs text-stone-400">{lang.uiText.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Language Selector Dropdown */}
          <select
            value={settings.language}
            onChange={(e) => onLanguageChange(e.target.value as LanguageId)}
            className="bg-stone-800/80 border border-stone-700/60 text-stone-100 px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:border-red-500 cursor-pointer"
          >
            {(Object.keys(LANGUAGES) as LanguageId[]).map((langId) => {
              const l = LANGUAGES[langId];
              return (
                <option key={langId} value={langId}>
                  {l.flag} {l.nativeName} ({l.name})
                </option>
              );
            })}
          </select>

          <div className="flex items-center space-x-1.5 bg-stone-800/80 border border-stone-700/60 px-3 py-1.5 rounded-lg text-xs text-stone-400">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>24kHz Zero-Latency Audio</span>
          </div>
        </div>
      </div>
    </header>
  );
};
