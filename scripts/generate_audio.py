#!/usr/bin/env python3
"""
Generate and precision-trim natural language number audio assets with edge-tts.

Outputs are written to public/audio/<language>/<voice>/ so each language can
provide its own voices and token sets without changing the audio player.

Usage:
    python3 scripts/generate_audio.py                 # all languages and voices
    python3 scripts/generate_audio.py --lang ja       # Japanese voices only
    python3 scripts/generate_audio.py --lang ja --voice nanami
"""

import argparse
import asyncio
import json
import os
import struct
import subprocess
import tempfile
import wave

import edge_tts

AUDIO_BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../public/audio"))

ZH_TOKENS = [
    # Digits 0-9
    {"key": "0", "char": "零", "pinyin": "líng", "desc": "Zero"},
    {"key": "1", "char": "一", "pinyin": "yī", "desc": "One (Standard)"},
    {"key": "2", "char": "二", "pinyin": "èr", "desc": "Two (Standard/Digits)"},
    {"key": "2_liang", "char": "两", "pinyin": "liǎng", "desc": "Two (Before 百, 千, 万, 亿)"},
    {"key": "3", "char": "三", "pinyin": "sān", "desc": "Three"},
    {"key": "4", "char": "四", "pinyin": "sì", "desc": "Four"},
    {"key": "5", "char": "五", "pinyin": "wǔ", "desc": "Five"},
    {"key": "6", "char": "六", "pinyin": "liù", "desc": "Six"},
    {"key": "7", "char": "七", "pinyin": "qī", "desc": "Seven"},
    {"key": "8", "char": "八", "pinyin": "bā", "desc": "Eight"},
    {"key": "9", "char": "九", "pinyin": "jiǔ", "desc": "Nine"},

    # Base units
    {"key": "10", "char": "十", "pinyin": "shí", "desc": "Ten"},
    {"key": "100", "char": "百", "pinyin": "bǎi", "desc": "Hundred"},
    {"key": "1000", "char": "千", "pinyin": "qiān", "desc": "Thousand"},
    {"key": "10000", "char": "万", "pinyin": "wàn", "desc": "Ten Thousand (Myriad)"},
    {"key": "100000000", "char": "亿", "pinyin": "yì", "desc": "Hundred Million"},

    # Phone number special
    {"key": "yao", "char": "幺", "pinyin": "yāo", "desc": "One (Phone numbers / codes)"},

    # Date units
    {"key": "nian", "char": "年", "pinyin": "nián", "desc": "Year"},
    {"key": "yue", "char": "月", "pinyin": "yuè", "desc": "Month"},
    {"key": "hao", "char": "号", "pinyin": "hào", "desc": "Day (Spoken)"},
    {"key": "ri", "char": "日", "pinyin": "rì", "desc": "Day (Formal)"},
]

JA_TOKENS = [
    # Digits 0-9
    {"key": "0", "char": "ゼロ", "pinyin": "zero", "desc": "Zero"},
    {"key": "1", "char": "いち", "pinyin": "ichi", "desc": "One"},
    {"key": "2", "char": "に", "pinyin": "ni", "desc": "Two"},
    {"key": "3", "char": "さん", "pinyin": "san", "desc": "Three"},
    {"key": "4", "char": "よん", "pinyin": "yon", "desc": "Four (Phone / dates)"},
    {"key": "5", "char": "ご", "pinyin": "go", "desc": "Five"},
    {"key": "6", "char": "ろく", "pinyin": "roku", "desc": "Six"},
    {"key": "7", "char": "なな", "pinyin": "nana", "desc": "Seven"},
    {"key": "8", "char": "はち", "pinyin": "hachi", "desc": "Eight"},
    {"key": "9", "char": "きゅう", "pinyin": "kyū", "desc": "Nine"},

    # Base units
    {"key": "10", "char": "じゅう", "pinyin": "jū", "desc": "Ten"},
    {"key": "100", "char": "ひゃく", "pinyin": "hyaku", "desc": "Hundred"},
    {"key": "1000", "char": "せん", "pinyin": "sen", "desc": "Thousand"},
    {"key": "10000", "char": "まん", "pinyin": "man", "desc": "Ten Thousand"},
    {"key": "100000000", "char": "おく", "pinyin": "oku", "desc": "Hundred Million"},

    # Rendaku sound shifts
    {"key": "300", "char": "さんびゃく", "pinyin": "sanbyaku", "desc": "300 (sanbyaku)"},
    {"key": "600", "char": "ろっぴゃく", "pinyin": "roppyaku", "desc": "600 (roppyaku)"},
    {"key": "800", "char": "はっぴゃく", "pinyin": "happyaku", "desc": "800 (happyaku)"},
    {"key": "3000", "char": "さんぜん", "pinyin": "sanzen", "desc": "3000 (sanzen)"},
    {"key": "8000", "char": "はっせん", "pinyin": "hassen", "desc": "8000 (hassen)"},
    {"key": "4_shi", "char": "し", "pinyin": "shi", "desc": "4 (shi, before 月/日)"},
    {"key": "7_shichi", "char": "しち", "pinyin": "shichi", "desc": "7 (shichi, in dates)"},
    {"key": "9_ku", "char": "く", "pinyin": "ku", "desc": "9 (ku, in dates)"},

    # Phone number separator and date units
    {"key": "no", "char": "の", "pinyin": "no", "desc": "Phone number chunk separator"},
    {"key": "gatsu", "char": "がつ", "pinyin": "gatsu", "desc": "Month (月)"},
    {"key": "nichi", "char": "にち", "pinyin": "nichi", "desc": "Day (日)"},
    {"key": "nen", "char": "ねん", "pinyin": "nen", "desc": "Year (年)"},

    # Irregular native day readings
    {"key": "tsuitachi", "char": "ついたち", "pinyin": "tsuitachi", "desc": "1st"},
    {"key": "futsuka", "char": "ふつか", "pinyin": "futsuka", "desc": "2nd"},
    {"key": "mikka", "char": "みっか", "pinyin": "mikka", "desc": "3rd"},
    {"key": "yokka", "char": "よっか", "pinyin": "yokka", "desc": "4th"},
    {"key": "itsuka", "char": "いつか", "pinyin": "itsuka", "desc": "5th"},
    {"key": "muika", "char": "むいか", "pinyin": "muika", "desc": "6th"},
    {"key": "nanoka", "char": "なのか", "pinyin": "nanoka", "desc": "7th"},
    {"key": "youka", "char": "ようか", "pinyin": "yōka", "desc": "8th"},
    {"key": "kokonoka", "char": "ここのか", "pinyin": "kokonoka", "desc": "9th"},
    {"key": "tooka", "char": "とおか", "pinyin": "tōka", "desc": "10th"},
    {"key": "hatsuka", "char": "はつか", "pinyin": "hatsuka", "desc": "20th"},
]

LANGS = {
    "zh": {
        "voices": [
            {"id": "xiaoxiao", "name": "Xiaoxiao", "gender": "Female", "tts_voice": "zh-CN-XiaoxiaoNeural"},
            {"id": "yunxi", "name": "Yunxi", "gender": "Male", "tts_voice": "zh-CN-YunxiNeural"},
        ],
        "tokens": ZH_TOKENS,
    },
    "ja": {
        "voices": [
            {"id": "nanami", "name": "Nanami", "gender": "Female", "tts_voice": "ja-JP-NanamiNeural"},
            {"id": "keita", "name": "Keita", "gender": "Male", "tts_voice": "ja-JP-KeitaNeural"},
        ],
        "tokens": JA_TOKENS,
    },
}


def trim_and_fade_audio(input_wav_path, output_wav_path, threshold_ratio=0.02, pad_ms=115, fade_ms=10):
    with wave.open(input_wav_path, 'rb') as w:
        nchannels = w.getnchannels()
        sampwidth = w.getsampwidth()
        framerate = w.getframerate()
        nframes = w.getnframes()
        raw_frames = w.readframes(nframes)

    assert sampwidth == 2, "Only 16-bit PCM is supported"

    total_samples = nframes * nchannels
    samples = list(struct.unpack(f'<{total_samples}h', raw_frames))
    if not samples:
        return 0.0

    peak = max(abs(s) for s in samples)
    threshold = max(300, int(peak * threshold_ratio))

    start_frame = 0
    for i in range(0, total_samples, nchannels):
        frame_max = max(abs(samples[i + c]) for c in range(nchannels))
        if frame_max > threshold:
            pad_frames = int(framerate * (pad_ms / 1000.0))
            start_frame = max(0, (i // nchannels) - pad_frames)
            break

    end_frame = nframes
    for i in range(total_samples - nchannels, -1, -nchannels):
        frame_max = max(abs(samples[i + c]) for c in range(nchannels))
        if frame_max > threshold:
            pad_frames = int(framerate * (pad_ms / 1000.0))
            end_frame = min(nframes, (i // nchannels) + 1 + pad_frames)
            break

    trimmed_samples = samples[start_frame * nchannels : end_frame * nchannels]
    trimmed_frame_count = len(trimmed_samples) // nchannels

    fade_frames = min(trimmed_frame_count // 4, int(framerate * (fade_ms / 1000.0)))
    if fade_frames > 0:
        for f in range(fade_frames):
            factor = f / float(fade_frames)
            for c in range(nchannels):
                idx = f * nchannels + c
                trimmed_samples[idx] = int(trimmed_samples[idx] * factor)
                end_idx = (trimmed_frame_count - 1 - f) * nchannels + c
                trimmed_samples[end_idx] = int(trimmed_samples[end_idx] * factor)

    with wave.open(output_wav_path, 'wb') as out_w:
        out_w.setparams((nchannels, sampwidth, framerate, trimmed_frame_count, 'NONE', 'not compressed'))
        out_w.writeframes(struct.pack(f'<{len(trimmed_samples)}h', *trimmed_samples))

    return trimmed_frame_count / float(framerate)


async def generate_voice_assets(language, voice_conf, tokens, temp_dir):
    voice_id = voice_conf["id"]
    tts_voice = voice_conf["tts_voice"]
    output_dir = os.path.join(AUDIO_BASE_DIR, language, voice_id)
    os.makedirs(output_dir, exist_ok=True)

    manifest = []
    print(f"\n--- {language}/{voice_id}: {voice_conf['name']} ({tts_voice}) ---")

    for item in tokens:
        key = item["key"]
        char = item["char"]

        raw_mp3 = os.path.join(temp_dir, f"{language}_{voice_id}_{key}.mp3")
        raw_wav = os.path.join(temp_dir, f"{language}_{voice_id}_{key}_raw.wav")
        final_wav = os.path.join(output_dir, f"{key}.wav")

        await edge_tts.Communicate(char, tts_voice).save(raw_mp3)

        subprocess.run([
            "afconvert", "-f", "WAVE", "-d", "LEI16@24000", "-c", "1",
            raw_mp3, raw_wav,
        ], check=True)

        duration = trim_and_fade_audio(raw_wav, final_wav)
        manifest.append({
            "key": key,
            "char": char,
            "pinyin": item["pinyin"],
            "desc": item["desc"],
            "file": f"{key}.wav",
            "durationSec": round(duration, 3),
            "sizeBytes": os.path.getsize(final_wav),
        })
        print(f"  ✓ [{language}/{voice_id}] {key:>9} ({item['pinyin']}) -> {duration:.3f}s")

        for temp_file in (raw_mp3, raw_wav):
            if os.path.exists(temp_file):
                os.remove(temp_file)

    manifest_path = os.path.join(output_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)


async def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lang", choices=["all", *LANGS], default="all")
    parser.add_argument("--voice", help="Generate only this voice id (requires --lang, not 'all')")
    args = parser.parse_args()

    if args.voice and args.lang == "all":
        parser.error("--voice requires --lang zh or --lang ja")

    temp_dir = os.path.join(tempfile.gettempdir(), "language_neural_tmp")
    os.makedirs(temp_dir, exist_ok=True)

    for lang_id, lang_conf in LANGS.items():
        if args.lang != "all" and args.lang != lang_id:
            continue
        for voice_conf in lang_conf["voices"]:
            if args.voice and args.voice != voice_conf["id"]:
                continue
            await generate_voice_assets(lang_id, voice_conf, lang_conf["tokens"], temp_dir)

    print("\nAll requested audio assets generated successfully!")


if __name__ == "__main__":
    asyncio.run(main())
