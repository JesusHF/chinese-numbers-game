# Chinese Numbers Game

Audio assets for the Chinese Numbers Game: Mandarin pronunciations of digits, units, and date-related characters used by the game.

## Contents

- `public/audio/` — 21 WAV files and a `manifest.json` describing each token (character, pinyin, duration, file).
- `scripts/generate_audio.py` — regenerates the WAV files using macOS `say` (Tingting voice) and `afconvert`, then trims silence and applies micro fades for gapless playback.

## Regenerating audio

On macOS, run:

```bash
python3 scripts/generate_audio.py
```
