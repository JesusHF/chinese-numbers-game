#!/usr/bin/env python3
"""
Generate and precision-trim high-definition, natural human Chinese audio assets
using Microsoft Neural TTS voices (Xiaoxiao - Female, Yunxi - Male).
"""

import os
import asyncio
import subprocess
import wave
import struct
import json
import edge_tts

AUDIO_BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../public/audio"))

VOICES = [
    {"id": "xiaoxiao", "name": "Xiaoxiao", "gender": "Female", "tts_voice": "zh-CN-XiaoxiaoNeural"},
    {"id": "yunxi", "name": "Yunxi", "gender": "Male", "tts_voice": "zh-CN-YunxiNeural"},
]

TOKENS = [
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
    
    # Dates units
    {"key": "nian", "char": "年", "pinyin": "nián", "desc": "Year"},
    {"key": "yue", "char": "月", "pinyin": "yuè", "desc": "Month"},
    {"key": "hao", "char": "号", "pinyin": "hào", "desc": "Day (Spoken)"},
    {"key": "ri", "char": "日", "pinyin": "rì", "desc": "Day (Formal)"},
]

def trim_and_fade_audio(input_wav_path, output_wav_path, threshold_ratio=0.03, pad_ms=15, fade_ms=5):
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

async def generate_voice_assets(voice_conf, temp_dir):
    voice_id = voice_conf["id"]
    tts_voice = voice_conf["tts_voice"]
    output_dir = os.path.join(AUDIO_BASE_DIR, voice_id)
    os.makedirs(output_dir, exist_ok=True)
    
    manifest = []
    print(f"\n--- Generating Voice: {voice_conf['name']} ({voice_conf['gender']} - {tts_voice}) ---")
    
    for item in TOKENS:
        key = item["key"]
        char = item["char"]
        pinyin = item["pinyin"]
        
        raw_mp3 = os.path.join(temp_dir, f"{voice_id}_{key}.mp3")
        raw_wav = os.path.join(temp_dir, f"{voice_id}_{key}_raw.wav")
        final_wav = os.path.join(output_dir, f"{key}.wav")
        
        # 1. Synthesize with Neural TTS
        communicate = edge_tts.Communicate(char, tts_voice)
        await communicate.save(raw_mp3)
        
        # 2. Convert to standard 24kHz 16-bit mono PCM WAV
        subprocess.run([
            "afconvert",
            "-f", "WAVE",
            "-d", "LEI16@24000",
            "-c", "1",
            raw_mp3,
            raw_wav
        ], check=True)
        
        # 3. Precision silence trimming
        duration = trim_and_fade_audio(raw_wav, final_wav, threshold_ratio=0.03, pad_ms=15, fade_ms=5)
        file_size = os.path.getsize(final_wav)
        
        manifest.append({
            "key": key,
            "char": char,
            "pinyin": pinyin,
            "desc": item["desc"],
            "file": f"{key}.wav",
            "durationSec": round(duration, 3),
            "sizeBytes": file_size
        })
        
        print(f"  ✓ [{voice_id}] [{key:>9}] {char} ({pinyin:<5}) -> {duration:.3f}s")
        
        if os.path.exists(raw_mp3): os.remove(raw_mp3)
        if os.path.exists(raw_wav): os.remove(raw_wav)
        
    manifest_path = os.path.join(output_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

async def main():
    temp_dir = "/tmp/chinese_neural_tmp"
    os.makedirs(temp_dir, exist_ok=True)
    
    for voice_conf in VOICES:
        await generate_voice_assets(voice_conf, temp_dir)
        
    print("\nAll neural voice assets generated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
