// Web Audio API - Bağlama (Saz) Sentezleyici & Pitch Detection Engine

import { frequencyToNote, getBaglamaFretForNote, BaglamaNoteItem } from "./baglamaNotes";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Bağlama / Saz Tezene Vuruşu Sentezleyici (Karplus-Strong String Synthesis + Resonator)
 */
export function playBaglamaPluck(freqHz: number, durationSec: number = 1.2) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // 1. Tezene (Plectrum) Vuruş Sesi (Filtered Noise Transient)
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.015, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 3000;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    // 2. Ana Tel Rezonansı (Oscillator Harmonics + Decaying Envelope)
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    osc.type = "sawtooth";
    osc2.type = "triangle";

    osc.frequency.setValueAtTime(freqHz, now);
    osc2.frequency.setValueAtTime(freqHz * 2, now); // 2. harmonik tınlama

    // Gövde Rezonans Filtresi (Su Kabağı / Ağaç Gövde Tınısı)
    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = "lowpass";
    bodyFilter.frequency.setValueAtTime(2500, now);
    bodyFilter.frequency.exponentialRampToValueAtTime(800, now + durationSec);

    const stringGain = ctx.createGain();
    stringGain.gain.setValueAtTime(0.6, now);
    stringGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(bodyFilter);
    osc2.connect(bodyFilter);
    bodyFilter.connect(stringGain);

    // Birleştirme ve Çıkış
    noiseGain.connect(ctx.destination);
    stringGain.connect(ctx.destination);

    noiseSource.start(now);
    osc.start(now);
    osc2.start(now);

    osc.stop(now + durationSec);
    osc2.stop(now + durationSec);
  } catch (e) {
    console.error("Bağlama Sesi Çalınamadı:", e);
  }
}

/**
 * Hızlı ve Optimize Edilmiş Pitch Detection (Yüksek Performanslı Autocorrelation)
 */
export function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    const val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // Ses çok kısıksa veya sessizlikse -1 dön
  if (rms < 0.018) return -1;

  const HALF = Math.floor(SIZE / 2);
  let maxval = -1;
  let maxpos = -1;

  // Bağlama Frekans Aralığı: 70Hz - 800Hz
  const minLag = Math.floor(sampleRate / 800);
  const maxLag = Math.floor(sampleRate / 70);

  for (let lag = minLag; lag < maxLag; lag += 2) {
    let sum = 0;
    for (let i = 0; i < HALF; i += 2) {
      sum += buf[i] * buf[i + lag];
    }
    if (sum > maxval) {
      maxval = sum;
      maxpos = lag;
    }
  }

  if (maxpos <= 0) return -1;
  return sampleRate / maxpos;
}

/**
 * Yüklenen Ses Dosyasını (MP3/WAV) Hızlı, Dondurmayan Async Analiz ile Bağlama Notalarına Dönüştürme
 */
export async function transcribeAudioFileToNotes(
  file: File,
  onProgress?: (percent: number) => void
): Promise<BaglamaNoteItem[]> {
  const ctx = getAudioContext();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

  const floatData = audioBuffer.getChannelData(0); // Sol kanal
  const sampleRate = audioBuffer.sampleRate;

  const windowSize = 2048;
  const hopSize = 3072; // ~60ms adımlarla son derece hızlı ve akıcı analiz
  const totalSteps = Math.floor((floatData.length - windowSize) / hopSize);

  const notesList: BaglamaNoteItem[] = [];
  let lastNoteName = "";
  let noteStartTime = 0;

  for (let i = 0; i < totalSteps; i++) {
    // Her 30 adımda bir tarayıcı UI arayüzünün nefes almasını ve donmamasını sağla (Async Yielding)
    if (i % 30 === 0) {
      if (onProgress) {
        onProgress(Math.round((i / totalSteps) * 100));
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const offset = i * hopSize;
    const slice = floatData.subarray(offset, offset + windowSize);
    const pitchHz = autoCorrelate(slice, sampleRate);

    if (pitchHz > 70 && pitchHz < 800) {
      const noteData = frequencyToNote(pitchHz);
      const currentTime = offset / sampleRate;

      // Aynı nota devam ediyorsa birleştir, değiştiyse yeni nota ekle
      if (noteData.noteName !== lastNoteName || currentTime - noteStartTime > 0.35) {
        lastNoteName = noteData.noteName;
        noteStartTime = currentTime;

        const fretInfo = getBaglamaFretForNote(noteData.noteName, noteData.octave);

        notesList.push({
          id: `transcribed_${notesList.length}_${Date.now()}`,
          timeSec: Math.round(currentTime * 10) / 10,
          noteName: noteData.noteName,
          octave: noteData.octave,
          freqHz: Math.round(pitchHz),
          stringName: fretInfo.stringName,
          fretNumber: fretInfo.fretNumber,
          fingerHint: fretInfo.fingerHint,
        });
      }
    }
  }

  if (onProgress) onProgress(100);
  return notesList;
}
