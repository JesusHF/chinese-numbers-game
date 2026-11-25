# Chinese Numbers Game | 中文数字听力练习

An interactive web-based listening practice game for Mandarin Chinese numbers. The game trains listening comprehension with natural Mandarin pronunciations, immediate autoplay, and modular practice modes.

## Features

- **Extensible Practice Modes**:
  - **Classic Numbers**: Positional values (`十`, `百`, `千`, `万`, `亿`), internal zeroes, tens rule (`10–19`), and `两` vs `二`.
  - **Phone Numbers**: Spoken digit-by-digit where `1` is pronounced as **yāo (幺)** with natural rhythm pauses.
  - **Dates**: Randomly generated months (`月`) and days (`号`), with an optional toggle to include years (`年`).
- **Decoupled Difficulty & Range**:
  - **Difficulty**:
    - **Easy**: `0.7x` speed + visual scaffolding (Hanzi & Pinyin guides).
    - **Medium**: `1.0x` speed + **strict audio-only** (zero visual clues).
    - **Hard**: `1.2x` speed + **strict audio-only** (fast speech).
  - **Number Range**: Dual dropdowns (Min: `0` to `1,000,000`, Max: `9` to `9,999,999`) with smart defaults per difficulty.
- **Pre-cached Zero-Latency Audio**:
  - 21 sample-accurate, silence-trimmed 24kHz WAV files preloaded into browser memory.
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
- `python3 scripts/generate_audio.py`: (macOS only) Regenerates and silence-trims audio files into `public/audio/`.

## License

MIT
