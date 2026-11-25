import React from 'react';
import { Volume2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-stone-800 bg-stone-900/80 backdrop-blur sticky top-0 z-50 py-4 px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-950/40">
            <span className="chinese-font text-white font-black text-xl">数</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-stone-100 flex items-center space-x-2">
              <span>Chinese Numbers Game</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800/60 font-normal">
                中文听力
              </span>
            </h1>
            <p className="text-xs text-stone-400">Master Mandarin numbers, phone codes & dates by ear</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-stone-400">
          <div className="flex items-center space-x-1.5 bg-stone-800/80 border border-stone-700/60 px-3 py-1.5 rounded-lg">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>24kHz Zero-Latency Audio</span>
          </div>
        </div>
      </div>
    </header>
  );
};
