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
 * Autocorrelation Pitch Detection Algorithm
 * Mikrofondan veya Ses Dosyasından Pitch (Frekans Hz) Çıkarma
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
  if (rms < 0.015) return -1;

  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.2;

  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) {
      r1 = i;
      break;
    }
  }

  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }
  }

  const buf2 = buf.slice(r1, r2);
  const c = new Float32Array(buf2.length);

  for (let i = 0; i < buf2.length; i++) {
    for (let j = 0; j < buf2.length - i; j++) {
      c[i] = c[i] + buf2[j] * buf2[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;

  let maxval = -1;
  let maxpos = -1;

  for (let i = d; i < buf2.length; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;

  // İnterpolasyon ile hassas Hz hesabı
  const x1 = c[T0 - 1];
  const x2 = c[T0];
  const x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;

  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

/**
 * Yüklenen Ses Dosyasını (MP3/WAV) Analiz Edip Bağlama Notalarına Dönüştürme
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
  const hopSize = 1024; // ~23ms adımlarla analiz
  const totalSteps = Math.floor((floatData.length - windowSize) / hopSize);

  const notesList: BaglamaNoteItem[] = [];
  let lastNoteName = "";
  let noteStartTime = 0;

  for (let i = 0; i < totalSteps; i++) {
    if (onProgress && i % 20 === 0) {
      onProgress(Math.round((i / totalSteps) * 100));
    }

    const offset = i * hopSize;
    const slice = floatData.subarray(offset, offset + windowSize);
    const pitchHz = autoCorrelate(slice, sampleRate);

    // Bağlama frekans aralığı dışındaki aşırı pes/tiz gürültüleri filtrele (70Hz - 800Hz)
    if (pitchHz > 70 && pitchHz < 800) {
      const noteData = frequencyToNote(pitchHz);
      const currentTime = offset / sampleRate;

      // Aynı nota devam ediyorsa birleştir, değiştiyse yeni nota ekle
      if (noteData.noteName !== lastNoteName || currentTime - noteStartTime > 0.4) {
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
