"use client";

import { useEffect, useRef, useState } from "react";
import {
  BaglamaNoteItem,
  getBaglamaFretForNote,
  MAKAM_PRESETS,
  TURKU_PRESETS,
  MakamGenre,
  generateSampleMelody,
  transposeNote,
  snapNotesToMakam,
  smoothAndFilterMelodyNotes,
  noteToFrequency,
  StringName,
} from "@/lib/baglamaNotes";
import {
  playBaglamaPluck,
  transcribeAudioFileToNotes,
  autoCorrelate,
} from "@/lib/baglamaAudio";

export default function BaglamaStudio() {
  // Seçili Müzik Türü / Makam
  const [genre, setGenre] = useState<MakamGenre>("halk");
  const [transposition, setTransposition] = useState<number>(0);

  // Notalar Listesi
  const [notes, setNotes] = useState<BaglamaNoteItem[]>([]);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number>(-1);

  // Oynatma Durumları
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setSpeed] = useState<number>(1.0); // 0.5x, 0.75x, 1.0x, 1.5x, 2.0x, 3.0x
  const [isLooping, setIsLooping] = useState<boolean>(false);

  // Ses Yükleme & Analiz Durumu
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcribeProgress, setTranscribeProgress] = useState<number>(0);

  // Ses Aralığı Tespiti (Mikrofon)
  const [isMeasuringVoice, setIsMeasuringVoice] = useState<boolean>(false);
  const [measuredLowestNote, setMeasuredLowestNote] = useState<string>("");
  const [measuredHighestNote, setMeasuredHighestNote] = useState<string>("");
  const [voiceAdvice, setVoiceAdvice] = useState<string>("");

  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sayfa açıldığında varsayılan Gönül Dağı türküsünü yükle
  useEffect(() => {
    const sample = generateSampleMelody(genre);
    setNotes(sample);
  }, [genre]);

  // Transpoze uygulandığında tüm notaları güncelle
  function applyTransposition(semitones: number) {
    setTransposition(semitones);
    setNotes((prevNotes) =>
      prevNotes.map((n) => {
        const newNoteName = transposeNote(n.noteName, semitones);
        const fretInfo = getBaglamaFretForNote(newNoteName, n.octave);
        return {
          ...n,
          noteName: newNoteName,
          stringName: fretInfo.stringName,
          fretNumber: fretInfo.fretNumber,
          fingerHint: fretInfo.fingerHint,
        };
      })
    );
  }

  // Notaları Seçili Makam Dizisine Oturt & Gürültüleri Temizle
  function handleCleanAndSnapToMakam() {
    if (notes.length === 0) return;
    const cleaned = snapNotesToMakam(notes, genre);
    setNotes(cleaned);
  }

  // Melodideki Parazitleri Sil & Akıcı Akor Dizisine Dönüştür (Smoother)
  function handleSmoothMelody() {
    if (notes.length === 0) return;
    const smoothed = smoothAndFilterMelodyNotes(notes, genre);
    setNotes(smoothed);
  }

  // Hazır Otantik Türkü Yükleme (Gönül Dağı, Uzun İnce vb.)
  function handleLoadTurku(presetKey: string) {
    const preset = TURKU_PRESETS[presetKey];
    if (!preset) return;

    setGenre(preset.genre);
    setTransposition(0);

    const newNotes: BaglamaNoteItem[] = preset.notes.map((note, i) => {
      const fretInfo = getBaglamaFretForNote(note, 3);
      return {
        id: `turku_${i}_${Date.now()}`,
        timeSec: i * 0.8,
        noteName: note,
        octave: 3,
        freqHz: noteToFrequency(note, 3),
        stringName: fretInfo.stringName,
        fretNumber: fretInfo.fretNumber,
        fingerHint: fretInfo.fingerHint,
        lyricsWord: preset.words[i % preset.words.length],
      };
    });

    setNotes(newNotes);
  }

  // Tekil Nota Değiştirme
  function handleUpdateNoteName(index: number, newNoteName: string) {
    const fretInfo = getBaglamaFretForNote(newNoteName, 3);
    setNotes((prev) =>
      prev.map((n, i) => {
        if (i !== index) return n;
        return {
          ...n,
          noteName: newNoteName,
          freqHz: noteToFrequency(newNoteName, 3),
          stringName: fretInfo.stringName,
          fretNumber: fretInfo.fretNumber,
          fingerHint: fretInfo.fingerHint,
        };
      })
    );
  }

  // Tekil Nota Silme
  function handleDeleteNote(index: number) {
    setNotes((prev) => prev.filter((_, i) => i !== index));
  }

  // Yeni Nota Ekleme
  function handleAddNote(noteName: string = "La") {
    const fretInfo = getBaglamaFretForNote(noteName, 3);
    const newNote: BaglamaNoteItem = {
      id: `add_${Date.now()}`,
      timeSec: notes.length * 0.8,
      noteName,
      octave: 3,
      freqHz: noteToFrequency(noteName, 3),
      stringName: fretInfo.stringName,
      fretNumber: fretInfo.fretNumber,
      fingerHint: fretInfo.fingerHint,
    };
    setNotes((prev) => [...prev, newNote]);
  }

  // Şarkıyı / Notaları Baştan Sona Bağlama Sesiyle Çal
  function handleStartPlay() {
    if (notes.length === 0) return;
    setIsPlaying(true);
    playStep(0);
  }

  function handleStopPlay() {
    setIsPlaying(false);
    setActiveNoteIndex(-1);
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
  }

  function playStep(index: number) {
    if (index >= notes.length) {
      if (isLooping) {
        playStep(0);
      } else {
        setIsPlaying(false);
        setActiveNoteIndex(-1);
      }
      return;
    }

    setActiveNoteIndex(index);
    const item = notes[index];

    // Hıza göre tezene vuruş tınlamasını ve ritim gecikmesini dinamik hesapla
    const duration = Math.max(0.2, 0.9 / playSpeed);
    playBaglamaPluck(item.freqHz, duration);

    const delayMs = Math.max(100, (0.7 / playSpeed) * 1000);
    playTimerRef.current = setTimeout(() => {
      playStep(index + 1);
    }, delayMs);
  }

  // Dosya Yükleyip AI ile Bağlama Notasına Çıkarma
  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsTranscribing(true);
    setTranscribeProgress(0);

    try {
      const extractedNotes = await transcribeAudioFileToNotes(file, (percent) => {
        setTranscribeProgress(percent);
      });

      if (extractedNotes.length === 0) {
        alert("Ses dosyasında belirgin bir melodi algılanamadı. Lütfen daha net bir vokal / müzik yükleyin.");
      } else {
        // Otomatik olarak gürültüleri temizle, yumuşat ve makama oturt
        const smoothed = smoothAndFilterMelodyNotes(extractedNotes, genre);
        setNotes(smoothed);
        setTransposition(0);
      }
    } catch {
      alert("Ses analiz edilirken bir hata oluştu. Lütfen geçerli bir MP3/WAV dosyası yükleyin.");
    } finally {
      setIsTranscribing(false);
    }
  }

  // Mikrofondan Ses Aralığı Tespiti (Kendi Ses Tonuna Göre Transpoze)
  async function startVoiceRangeTest() {
    setIsMeasuringVoice(true);
    setMeasuredLowestNote("");
    setMeasuredHighestNote("");
    setVoiceAdvice("Lütfen 5 saniye boyunca mikrofona en pes sesinizden en tiz sesinize doğru şarkı söyleyin/konuşun...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      const detectedFreqs: number[] = [];

      const interval = setInterval(() => {
        analyser.getFloatTimeDomainData(buffer);
        const pitchHz = autoCorrelate(buffer, ctx.sampleRate);
        if (pitchHz > 80 && pitchHz < 800) {
          detectedFreqs.push(pitchHz);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        stream.getTracks().forEach((track) => track.stop());
        ctx.close();
        setIsMeasuringVoice(false);

        if (detectedFreqs.length < 5) {
          setVoiceAdvice("Sesiniz net algılanamadı. Lütfen mikrofona daha yakın ve yüksek sesle tekrar deneyin.");
          return;
        }

        detectedFreqs.sort((a, b) => a - b);
        const minFreq = detectedFreqs[0];
        const maxFreq = detectedFreqs[detectedFreqs.length - 1];

        const lowestMIDI = Math.round(69 + 12 * Math.log2(minFreq / 440));
        const highestMIDI = Math.round(69 + 12 * Math.log2(maxFreq / 440));

        const NOTE_NAMES = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];
        const lowName = NOTE_NAMES[((lowestMIDI % 12) + 12) % 12];
        const highName = NOTE_NAMES[((highestMIDI % 12) + 12) % 12];

        setMeasuredLowestNote(lowName);
        setMeasuredHighestNote(highName);

        setVoiceAdvice(
          `Ses Aralığınız Algılandı! En Pes: ${lowName}, En Tiz: ${highName}. Bağlama için ideal karar sesiniz: ${lowName} Karar! Notalar ses tonunuza uyarlandı.`
        );

        const targetShift = (lowestMIDI % 12) - 9;
        applyTransposition(targetShift);
      }, 5000);
    } catch {
      setIsMeasuringVoice(false);
      alert("Mikrofona erişilemedi. Lütfen mikrofon izinlerini kontrol edin.");
    }
  }

  const activeNote = activeNoteIndex >= 0 ? notes[activeNoteIndex] : notes[0];
  const activeMakamObj = MAKAM_PRESETS[genre];

  return (
    <div className="space-y-8">
      {/* Başlık & Kısa Sap Bağlama Bilgisi */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <span>🪕</span> Kısa Sap Bağlama Eğitmeni & Nota Çıkarıcı
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                Kara Düzen (La - Re - Sol)
              </span>
            </h2>
            <p className="mt-1 text-sm text-slate-300 leading-relaxed">
              Kendi AI / MP3 şarkılarını yükle, parazitleri temizleyip akıcı melodilere dök! 0.5x&apos;ten 3.0x&apos;e varan hız seçenekleriyle interaktif öğretmen eşliğinde öğren.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-center">
            <span className="block text-[11px] font-semibold text-slate-400">AKORT DÜZENİ</span>
            <span className="text-sm font-bold text-amber-400">Kara Düzen (Sol-Re-La)</span>
            <span className="block text-[10px] text-slate-500">19 Perde Kısa Sap</span>
          </div>
        </div>
      </div>

      {/* Hazır Türkü Notaları Seçici */}
      <div className="rounded-2xl border border-amber-500/30 bg-slate-950 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎼</span>
          <div>
            <h4 className="text-sm font-bold text-white">Hazır Türkü Notaları Yükle</h4>
            <p className="text-xs text-slate-400">İkonik eserlerin %100 kusursuz bağlama perdelerini yükleyip dinleyin ve öğrenin.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {Object.entries(TURKU_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleLoadTurku(key)}
              className="flex-1 sm:flex-none rounded-xl border border-amber-500/40 bg-amber-600/10 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-600/30 transition text-center shrink-0"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Kontrol Paneli: Tür Seçimi, Transpoze, Yükleme & Ses Tespiti */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Tür & Makam Seçimi */}
        <div className="md:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🎭</span> Müzik Türü & Makam Seçimi
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {(["halk", "tsm", "arabesk"] as MakamGenre[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setGenre(m)}
                className={`rounded-xl border p-2.5 text-center text-xs font-bold transition ${
                  genre === m
                    ? "border-amber-500 bg-amber-600/20 text-amber-200 shadow-md"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                }`}
              >
                {m === "halk" && "🌾 Halk Müziği"}
                {m === "tsm" && "🎶 Sanat Müziği"}
                {m === "arabesk" && "🎻 Arabesk"}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
            💡 <b>{activeMakamObj.name}:</b> {activeMakamObj.desc}
          </p>
        </div>

        {/* Ses Tonu / Transpoze & Mikrofon Ölçümü */}
        <div className="md:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">🎤 Kendi Ses Tonuna Göre Transpoze</span>
            <span className="text-xs text-amber-400 font-mono font-bold">
              Karar: {transposition >= 0 ? `+${transposition}` : transposition} Ses
            </span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => applyTransposition(transposition - 1)}
              className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
              title="Pesleştir (-1 Yarım Ses)"
            >
              ♭ 1 Ses Pesleştir
            </button>
            <button
              type="button"
              onClick={() => applyTransposition(0)}
              className="flex-1 rounded-lg bg-slate-950 border border-slate-800 py-2 text-xs font-semibold text-slate-300 hover:text-white transition text-center"
            >
              Sıfırla (Orjinal Ton)
            </button>
            <button
              type="button"
              onClick={() => applyTransposition(transposition + 1)}
              className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
              title="Tizleştir (+1 Yarım Ses)"
            >
              ♯ 1 Ses Tizleştir
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={startVoiceRangeTest}
              disabled={isMeasuringVoice}
              className="w-full rounded-xl bg-amber-600/30 border border-amber-500/50 py-2.5 px-4 text-xs font-bold text-amber-200 hover:bg-amber-600/50 transition flex items-center justify-center gap-2"
            >
              <span>{isMeasuringVoice ? "🎙️ Sesiniz Analiz Ediliyor (5 sn)..." : "🎙️ Ses Aralığımı Ölç ve İdeal Tona Transpoze Et"}</span>
            </button>
            {voiceAdvice && (
              <p className="mt-2 text-[11px] text-amber-300/90 bg-amber-950/40 p-2 rounded-lg border border-amber-900/30">
                {voiceAdvice}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Şarkı Yükleme, Temizleme & İnteraktif Oynatıcı Kontrolleri */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            {!isPlaying ? (
              <button
                type="button"
                onClick={handleStartPlay}
                className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white hover:bg-amber-500 transition shadow-lg"
              >
                <span>▶️</span> İnteraktif Öğretmen Çalsın
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopPlay}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white hover:bg-rose-500 transition shadow-lg"
              >
                <span>⏹️</span> Durdur
              </button>
            )}

            {/* Genişletilmiş Hız Seçenekleri (0.5x, 0.75x, 1.0x, 1.5x, 2.0x, 3.0x) */}
            <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
              <span className="text-xs font-medium text-slate-400 px-2 shrink-0">Hız:</span>
              {[0.5, 0.75, 1.0, 1.5, 2.0, 3.0].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`rounded-lg px-2 py-1 text-xs font-bold transition shrink-0 ${
                    playSpeed === s
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {s}x {s === 0.5 ? "(Yavaş)" : s === 3.0 ? "(Seri ⚡)" : ""}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                isLooping
                  ? "border-amber-500 bg-amber-500/20 text-amber-300"
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              🔁 Döngü {isLooping ? "(Açık)" : "(Kapalı)"}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleSmoothMelody}
              className="rounded-xl bg-emerald-600/30 border border-emerald-500/50 px-3.5 py-3 text-xs font-bold text-emerald-200 hover:bg-emerald-600/50 transition flex items-center gap-1.5"
              title="Sıçrayan parazitleri temizler ve notaları akıcı bağlama melodisine dönüştürür"
            >
              <span>🧹</span> Melodiyi Akıcı Yap & Parazitleri Sil
            </button>

            {/* Şarkı Yükle & Notalara Dök */}
            <label className="cursor-pointer rounded-xl bg-indigo-600/30 border border-indigo-500/50 px-4 py-3 text-xs font-bold text-indigo-200 hover:bg-indigo-600/50 transition flex items-center justify-center gap-2">
              <span>🎵</span> AI / MP3 Şarkı Yükle
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioUpload}
              />
            </label>
          </div>
        </div>

        {isTranscribing && (
          <div className="rounded-xl bg-slate-950 p-4 border border-indigo-500/30 space-y-2">
            <div className="flex justify-between text-xs font-bold text-indigo-300">
              <span>Şarkınız Analiz Ediliyor ve Bağlama Perdelerine Dökülüyor...</span>
              <span>%{transcribeProgress}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${transcribeProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Görsel İnteraktif Bağlama Sapı & Perde Rehberi */}
      <div className="rounded-2xl border border-amber-500/30 bg-slate-950 p-6 space-y-4 shadow-2xl overflow-x-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🎸</span> Kısa Sap Bağlama Klavyesi (Nereye Basacaksın?)
          </h3>
          {activeNote && (
            <div className="flex items-center gap-3 text-xs">
              <span className="rounded-lg bg-amber-500/20 px-3 py-1 font-bold text-amber-300">
                Nota: {activeNote.noteName}
              </span>
              <span className="rounded-lg bg-indigo-500/20 px-3 py-1 font-bold text-indigo-300">
                Tel: {activeNote.stringName}
              </span>
              <span className="rounded-lg bg-emerald-500/20 px-3 py-1 font-bold text-emerald-300">
                Perde: #{activeNote.fretNumber}
              </span>
              <span className="rounded-lg bg-slate-800 px-3 py-1 font-bold text-slate-200">
                Parmak: {activeNote.fingerHint}
              </span>
            </div>
          )}
        </div>

        {/* 19 Perdeli Görsel Bağlama Sapı */}
        <div className="relative min-w-[700px] py-4">
          <div className="relative h-28 rounded-r-3xl bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-y-4 border-amber-700/80 shadow-2xl flex flex-col justify-around py-2 px-6">
            {(["Üst Tel (Sol)", "Orta Tel (Re)", "Alt Tel (La)"] as StringName[]).map(
              (stringName, sIdx) => {
                const isCurrentString = activeNote?.stringName === stringName;
                return (
                  <div key={sIdx} className="relative flex items-center w-full h-4">
                    <span className="absolute -left-5 text-[9px] font-bold text-amber-200/80 w-12 truncate">
                      {stringName.split(" ")[0]}
                    </span>
                    <div
                      className={`w-full h-1 transition-all ${
                        isCurrentString
                          ? "bg-amber-300 shadow-[0_0_10px_#f59e0b] h-1.5"
                          : "bg-slate-400/60"
                      }`}
                    />
                  </div>
                );
              }
            )}

            <div className="absolute inset-0 flex justify-between px-10 pointer-events-none">
              {Array.from({ length: 19 }).map((_, fIdx) => {
                const fretNum = fIdx + 1;
                const isCurrentFret = activeNote?.fretNumber === fretNum;

                return (
                  <div
                    key={fIdx}
                    className="relative flex flex-col items-center justify-between h-full border-r border-amber-500/40"
                  >
                    <span className="text-[10px] font-bold text-amber-400/80 -top-5 absolute">
                      {fretNum}
                    </span>
                    {isCurrentFret && (
                      <div className="absolute top-1/2 -translate-y-1/2 -left-2.5 h-6 w-6 rounded-full bg-amber-400 shadow-[0_0_15px_#f59e0b] flex items-center justify-center animate-bounce text-slate-950 font-black text-xs">
                        {activeNote.fretNumber}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Şarkı Nota Listesi & Manuel Düzenleme (Tab Tablosu) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>📜</span> Şarkı Bağlama Notası & Parmak Tablosu ({notes.length} Nota)
          </h3>
          <button
            type="button"
            onClick={() => handleAddNote("La")}
            className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-slate-700 transition"
          >
            ➕ Yeni Nota Ekle
          </button>
        </div>

        {notes.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            Henüz nota eklenmedi. Yukarıdan hazır türkü yükleyin veya şarkı yükleyin.
          </p>
        ) : (
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 max-h-[380px] overflow-y-auto pr-1">
            {notes.map((item, idx) => {
              const isActive = activeNoteIndex === idx;
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-3 transition text-center relative group ${
                    isActive
                      ? "border-amber-400 bg-amber-500/20 text-white shadow-lg ring-2 ring-amber-400"
                      : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(idx)}
                    className="absolute top-1 right-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition text-xs font-bold px-1"
                    title="Bu notayı sil"
                  >
                    ✕
                  </button>

                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setActiveNoteIndex(idx);
                      playBaglamaPluck(item.freqHz, 0.8);
                    }}
                  >
                    <span className="text-[10px] font-mono text-slate-500 block">
                      #{idx + 1} ({item.timeSec}s)
                    </span>

                    {/* Nota Değiştirme Açılır Menüsü */}
                    <select
                      value={item.noteName}
                      onChange={(e) => handleUpdateNoteName(idx, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 bg-slate-900 border border-amber-500/50 text-amber-300 text-sm font-black rounded px-1.5 py-0.5 text-center cursor-pointer outline-none"
                    >
                      {["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "Si-b2", "Si"].map(
                        (nn) => (
                          <option key={nn} value={nn}>
                            {nn}
                          </option>
                        )
                      )}
                    </select>

                    <span className="text-[11px] font-semibold text-indigo-300 block mt-1">
                      {item.stringName.split(" ")[0]} - Perde #{item.fretNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      👈 {item.fingerHint}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
