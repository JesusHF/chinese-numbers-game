# Chinese Numbers Game | 中文数字听力练习

An interactive web-based listening practice game for Mandarin Chinese and Japanese numbers. Switch languages from the header dropdown; each language supplies its own voices, UI labels, and question generators. The game trains listening comprehension with natural neural pronunciations, immediate autoplay, and modular practice modes.

## Features

- **Two languages, one contract**: `src/languages/zh` and `src/languages/ja` each provide a `LanguageDefinition` (voices, localized labels, question generator). Adding another language means adding a folder, not touching the game loop.
- **Extensible Practice Modes**:
  - **Classic Numbers**: Positional values (`十`/`千`/`万`/`亿` in Chinese, `百`/`千`/`万`/`億` in Japanese), internal zeroes, with language-specific sound shifts (e.g. `sanbyaku`, `roppyaku`, `sanzen`).
  - **Phone Numbers**: Spoken digit-by-digit — Chinese uses **yāo (幺)** for `1`; Japanese uses `yon`, `nana`, `kyū` and `no` between chunks.
  - **Dates**: Chinese months (`月`) and days (`号`), or Japanese months with native day readings (`ついたち`, `ふつか`, `みっか`…), with an optional year toggle.
- **Decoupled Difficulty & Range**:
  - **Difficulty**:
    - **Easy**: `0.7x` speed + visual scaffolding (Hanzi & Pinyin guides).
    - **Medium**: `1.0x` speed + **strict audio-only** (zero visual clues).
    - **Hard**: `1.2x` speed + **strict audio-only** (fast speech).
  - **Number Range**: Dual dropdowns (Min: `0` to `1,000,000`, Max: `9` to `9,999,999`) with smart defaults per difficulty.
- **Pre-cached Zero-Latency Audio**:
  - Sample-accurate, silence-trimmed 24kHz WAV files stored per language and voice under `public/audio/<lang>/<voice>/` and preloaded into browser memory.
  - Frame-perfect Web Audio API scheduling with playback rate adjustment.
  - Automatic playback upon question presentation + `[Space]` replay shortcut.
- **Detailed Feedback & Review**:
  - Instant check with Hanzi, tone-marked Pinyin, and structural breakdowns.
  - Results summary screen with replay for every attempted number.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Scripts

- `npm run dev`: Starts local Vite dev server.
- `npm run build`: Type-checks and creates production build.
- `npm run preview`: Previews production build locally.
- `npm run test`: Runs unit tests via Vitest.
- `python3 scripts/generate_audio.py`: Regenerates audio with edge-tts (requires `pip install edge-tts` and internet) and silence-trims it into `public/audio/<lang>/<voice>/`. Use `--lang ja` or `--lang zh --voice yunxi` to limit generation.

## License

MIT
