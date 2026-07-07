"use client";

import { useEffect, useState } from "react";

type AIStyle = {
  key: string;
  label: string;
  emoji: string;
  rate: string;
  pitch: string;
  hint: string;
};

type SavedPreset = {
  id: string;
  name: string;
  voice: string;
  styleKey: string;
  useManual: boolean;
  ratePercent: number;
  pitchHz: number;
  pauseMs: number;
  enableNaturalCadence: boolean;
};

const STYLES: AIStyle[] = [
  {
    key: "narrator",
    label: "Anlatıcı",
    emoji: "🎬",
    rate: "+0%",
    pitch: "+0Hz",
    hint: "Doğal, akıcı ve standart anlatım tonu. Genel videolar için en uygun ses.",
  },
  {
    key: "cheerful",
    label: "Neşeli",
    emoji: "😊",
    rate: "+12%",
    pitch: "+4Hz",
    hint: "Canlı ve neşeli vurgu. İpucu: Metninizde ünlem (!) işareti kullanın.",
  },
  {
    key: "energetic",
    label: "Enerjik",
    emoji: "📢",
    rate: "+20%",
    pitch: "+6Hz",
    hint: "Coşkulu ve heyecanlı anlatım.",
  },
  {
    key: "surprised",
    label: "Şaşkın",
    emoji: "😲",
    rate: "-8%",
    pitch: "+8Hz",
    hint: "İnişli çıkışlı, meraklı tonlama. İpucu: 'Vay canına!' veya '!' ekleyin.",
  },
  {
    key: "calm",
    label: "Sakin",
    emoji: "😌",
    rate: "-15%",
    pitch: "-2Hz",
    hint: "Durağan, huzurlu ve adım adım tarif tonlaması.",
  },
  {
    key: "serious",
    label: "Ciddi",
    emoji: "🎙️",
    rate: "-5%",
    pitch: "-4Hz",
    hint: "Resmi, tutarlı ve bilgilendirici sunum tonu.",
  },
];

const AI_VOICES = [
  {
    id: "tr-TR-EmelNeural",
    name: "Emel (Türkçe Kadın - Gerçekçi AI)",
    gender: "Kadın 👩",
    desc: "Sıcak, akıcı ve son derece doğal Türkçe kadın sesi.",
  },
  {
    id: "tr-TR-AhmetNeural",
    name: "Ahmet (Türkçe Erkek - Gerçekçi AI)",
    gender: "Erkek 👨",
    desc: "Karizmatik, tok ve etkileyici Türkçe erkek sesi.",
  },
  {
    id: "en-US-AriaNeural",
    name: "Aria (İngilizce Kadın)",
    gender: "Kadın 👩",
    desc: "Akıcı İngilizce kadın anlatıcı.",
  },
  {
    id: "en-US-GuyNeural",
    name: "Guy (İngilizce Erkek)",
    gender: "Erkek 👨",
    desc: "Profesyonel İngilizce erkek anlatıcı.",
  },
];

export default function BrowserSpeech() {
  const [selectedVoice, setSelectedVoice] = useState<string>("tr-TR-EmelNeural");
  const [text, setText] = useState<string>("");
  const [styleKey, setStyleKey] = useState<string>("narrator");

  // Doğal Cümle Sonu Vurgusu ve Nefes Araları
  const [enableNaturalCadence, setEnableNaturalCadence] = useState<boolean>(true);
  const [pauseMs, setPauseMs] = useState<number>(350); // 350ms doğal anlatıcı nefesi

  // İnce ayar manuel kontrol anahtarı
  const [useManualFineTune, setUseManualFineTune] = useState<boolean>(false);
  const [ratePercent, setRatePercent] = useState<number>(0);
  const [pitchHz, setPitchHz] = useState<number>(0);

  // Kayıtlı Özel Ses Ayarları (LocalStorage)
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Sayfa yüklendiğinde kayıtlı ayarları getir
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ses_studyosu_presets");
      if (stored) {
        setSavedPresets(JSON.parse(stored));
      }
    } catch {
      // sessizce geç
    }
  }, []);

  // Ayarları kaydet
  function handleSavePreset() {
    if (!newPresetName.trim()) {
      alert("Lütfen kaydetmek için bir isim yazın (Örn: Sakin Lamba Anlatımı).");
      return;
    }

    const newPreset: SavedPreset = {
      id: String(Date.now()),
      name: newPresetName.trim(),
      voice: selectedVoice,
      styleKey,
      useManual: useManualFineTune,
      ratePercent,
      pitchHz,
      pauseMs,
      enableNaturalCadence,
    };

    const updated = [newPreset, ...savedPresets];
    setSavedPresets(updated);
    setNewPresetName("");
    try {
      localStorage.setItem("ses_studyosu_presets", JSON.stringify(updated));
    } catch {
      // sessizce geç
    }
  }

  // Kayıtlı ayarı yükle
  function handleLoadPreset(p: SavedPreset) {
    setSelectedVoice(p.voice);
    setStyleKey(p.styleKey);
    setUseManualFineTune(p.useManual);
    setRatePercent(p.ratePercent);
    setPitchHz(p.pitchHz);
    setPauseMs(p.pauseMs || 350);
    setEnableNaturalCadence(p.enableNaturalCadence !== undefined ? p.enableNaturalCadence : true);
  }

  // Kayıtlı ayarı sil
  function handleDeletePreset(id: string) {
    const updated = savedPresets.filter((p) => p.id !== id);
    setSavedPresets(updated);
    try {
      localStorage.setItem("ses_studyosu_presets", JSON.stringify(updated));
    } catch {
      // sessizce geç
    }
  }

  // Metni ve noktalamayı otomatik iyileştir (Robotik bitişleri engeller)
  function handleFixPunctuation() {
    if (!text.trim()) return;

    let fixed = text.trim();
    // 1. Çift boşlukları tek boşluk yap
    fixed = fixed.replace(/\s+/g, " ");

    // 2. Noktalama işaretlerinden sonra boşluk yoksa ekle
    fixed = fixed.replace(/([.,!?:;])([a-zA-Z0-9çğıöşüÇĞİÖŞÜ])/g, "$1 $2");

    // 3. Cümle sonu noktası yoksa ekle
    if (!/[.!?…]$/.test(fixed)) {
      fixed = fixed + ".";
    }

    // 4. İlk harfi büyük yap
    fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);

    setText(fixed);
  }

  const activeStyle = STYLES.find((s) => s.key === styleKey);
  const activeVoiceObj = AI_VOICES.find((v) => v.id === selectedVoice);

  function handleSelectStyle(s: AIStyle) {
    setStyleKey(s.key);
    if (!useManualFineTune) {
      const rVal = parseInt(s.rate.replace("%", "").replace("+", ""), 10) || 0;
      const pVal = parseInt(s.pitch.replace("Hz", "").replace("+", ""), 10) || 0;
      setRatePercent(rVal);
      setPitchHz(pVal);
    }
  }

  const effectiveRate = useManualFineTune
    ? ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`
    : activeStyle?.rate || "+0%";

  const effectivePitch = useManualFineTune
    ? pitchHz >= 0 ? `+${pitchHz}Hz` : `${pitchHz}Hz`
    : activeStyle?.pitch || "+0Hz";

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!text.trim()) {
      setError("Lütfen seslendirilecek bir metin girin.");
      return;
    }

    setLoading(true);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const res = await fetch("/api/edge-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice: selectedVoice,
          text: text.trim(),
          rate: effectiveRate,
          pitch: effectivePitch,
          styleKey,
          pauseMs,
          enableNaturalCadence,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ses üretilirken bir hata oluştu.");
      }

      const arrayBuffer = await res.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error("Ses dosyası üretilemedi veya boş döndü.");
      }

      // Açıkça audio/mpeg MIME tipinde MP3 Blob oluştur
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleGenerate}
      className="rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-6 shadow-xl space-y-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>♾️</span> Sınırsız Doğal AI Motoru (Emel & Ahmet)
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              0 Kredi · MP3 İndirilebilir
            </span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Kredi sınırı olmadan <b>Emel</b> ve <b>Ahmet</b> sesleri ile doğal cümle sonu vurgulu seslendirme yap ve MP3 indir.
          </p>
        </div>
      </div>

      {/* Ses Seçimi */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          Türkçe AI Ses Seçin
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {AI_VOICES.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedVoice(v.id)}
              className={`flex flex-col text-left rounded-xl border p-3.5 transition ${
                selectedVoice === v.id
                  ? "border-indigo-500 bg-indigo-600/20 text-white shadow-lg"
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100">{v.name}</span>
                <span className="text-xs font-medium text-indigo-300">{v.gender}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{v.desc}</p>
            </button>
          ))}
        </div>
        {activeVoiceObj && (
          <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
            <span>✅ Seçili Ses:</span>
            <span>{activeVoiceObj.name} (Doğal Yapay Zeka Seslendirmesi)</span>
          </p>
        )}
      </div>

      {/* Anlatım Tarzı Butonları */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-200">
            Anlatım Tarzı & Duygu
          </label>
          <span className="text-xs text-indigo-300 font-medium">
            Tarz: {activeStyle?.emoji} {activeStyle?.label}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {STYLES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => handleSelectStyle(s)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition ${
                styleKey === s.key
                  ? "border-indigo-500 bg-indigo-600/20 text-white shadow-md ring-1 ring-indigo-500"
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span className="text-xl">{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
        {activeStyle && (
          <p className="mt-2 rounded-lg bg-slate-800/60 px-3 py-2 text-xs text-slate-300">
            💡 <b>{activeStyle.label} Tarzı:</b> {activeStyle.hint}
            {!useManualFineTune && (
              <span className="block mt-1 text-indigo-300 font-medium">
                (Standart Oranlar: Hız {activeStyle.rate}, Ton {activeStyle.pitch})
              </span>
            )}
          </p>
        )}
      </div>

      {/* Metin Kutusu ve Otomatik Düzelt Butonu */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-semibold text-slate-200">
            Seslendirilecek Metin (Kredi Sınırı Yok)
          </label>
          <button
            type="button"
            onClick={handleFixPunctuation}
            className="rounded-lg bg-indigo-600/30 border border-indigo-500/50 px-3 py-1 text-xs font-bold text-indigo-200 hover:bg-indigo-600/50 transition flex items-center gap-1"
            title="Robotik bitişleri engellemek için noktalama ve boşlukları otomatik düzeltir"
          >
            <span>🪄</span> Metni Düzelt & Noktalamaları İyileştir
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          maxLength={5000}
          placeholder="Emel veya Ahmet sesiyle seslendirmek istediğin metni buraya yaz… (Cümle sonlarına nokta, virgül veya ünlem koymanız tonlamayı mükemmelleştirir)."
          className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
          <span className="text-indigo-400/80 italic">
            💡 İpucu: Cümle sonlarına koyduğunuz ( . ! ? ... ) işaretleri cümle sonunun doğal insansı süzülmeyle bitmesini sağlar.
          </span>
          <span>{text.length}/5000 Karakter</span>
        </div>
      </div>

      {/* Cümle Sonu Vurgusu ve Nefes Araları Motoru */}
      <div className="rounded-xl border border-indigo-500/30 bg-slate-950/90 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enableNaturalCadence}
              onChange={(e) => setEnableNaturalCadence(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 accent-indigo-500"
            />
            <span className="text-sm font-bold text-slate-100 flex items-center gap-1">
              <span>✨</span> Doğal Cümle Sonu Vurgusu & Nefes Araları Motoru
            </span>
          </label>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${enableNaturalCadence ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>
            {enableNaturalCadence ? "🟢 Aktif (İnsansı Tonlama)" : "⚪ Kapalı"}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Cümle sonlarındaki sert/robotik bitişleri engeller. Nokta, virgül ve ünlemlerden sonra yapay zekaya <b>gerçek insan nefesi ve doğal melodik süzülme</b> ekler.
        </p>

        {enableNaturalCadence && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1">
              <span>Cümle Sonu Nefes & Duraklama Süresi:</span>
              <span className="font-mono text-indigo-300 font-bold">
                {pauseMs}ms {pauseMs === 350 ? "(Doğal Anlatıcı - Önerilen)" : pauseMs < 300 ? "(Kısa Es)" : "(Derin / Tane Tane)"}
              </span>
            </div>
            <input
              type="range"
              min={150}
              max={600}
              step={50}
              value={pauseMs}
              onChange={(e) => setPauseMs(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-[10px] text-slate-500">
              <span>Hızlı/Seri (150ms)</span>
              <span>Doğal Anlatıcı (350ms)</span>
              <span>Derin/Tane Tane (600ms)</span>
            </div>
          </div>
        )}
      </div>

      {/* İnce Ayarlar (Kullanıcı Kontrolünde) */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useManualFineTune}
              onChange={(e) => setUseManualFineTune(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 accent-indigo-500"
            />
            <span className="text-sm font-bold text-slate-200">
              🎛️ Özel İnce Ayarları Devreye Sok (Manuel Kontrol Et)
            </span>
          </label>
          <span className="text-xs font-semibold text-slate-400">
            {useManualFineTune ? "🔴 Manuel Kontrol Aktif" : "🟢 Standart Duygu Oranı Aktif"}
          </span>
        </div>

        <p className="text-xs text-slate-400">
          {useManualFineTune
            ? "Manuel kontrol aktif. Aşağıdaki hız ve ton kaydırıcıları anlatım tarzı değiştirildiğinde sıfırlanmaz, tamamen sizin kontrolünüzdedir."
            : "Manuel kontrol kapalı. Seçtiğiniz anlatım tarzının (Anlatıcı, Neşeli, Sakin vb.) standart doğal duygusu kullanılır."}
        </p>

        {/* Manuel Kaydırıcılar */}
        <div className={`grid gap-4 sm:grid-cols-2 transition ${!useManualFineTune ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          <div>
            <div className="mb-1 flex justify-between items-center text-xs font-semibold text-slate-200">
              <span>Konuşma Hızı</span>
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-indigo-300 font-mono">
                {ratePercent >= 0 ? `% +${ratePercent}` : `% ${ratePercent}`} {ratePercent === 0 ? "(Doğal Standart)" : ratePercent > 0 ? "(Hızlı)" : "(Yavaş)"}
              </span>
            </div>
            <input
              type="range"
              min={-40}
              max={40}
              step={5}
              value={ratePercent}
              onChange={(e) => setRatePercent(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-[10px] text-slate-500">
              <span>Yavaş (-40%)</span>
              <span>Standart (0%)</span>
              <span>Hızlı (+40%)</span>
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between items-center text-xs font-semibold text-slate-200">
              <span>Ses Tonu / Tizlik (Pitch)</span>
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-indigo-300 font-mono">
                {pitchHz >= 0 ? `+${pitchHz}Hz` : `${pitchHz}Hz`} {pitchHz === 0 ? "(Doğal Standart)" : pitchHz > 0 ? "(Tiz/İnce)" : "(Tok/Kalın)"}
              </span>
            </div>
            <input
              type="range"
              min={-15}
              max={15}
              step={1}
              value={pitchHz}
              onChange={(e) => setPitchHz(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-[10px] text-slate-500">
              <span>Tok/Kalın (-15Hz)</span>
              <span>Standart (0Hz)</span>
              <span>Tiz/İnce (+15Hz)</span>
            </div>
          </div>
        </div>

        {/* Aktif Ayar Özeti */}
        <div className="rounded-lg bg-slate-900/80 p-2.5 text-xs text-slate-300 flex items-center justify-between">
          <span>Uygulanacak Oranlar:</span>
          <span className="font-mono font-bold text-indigo-300">
            Hız: {effectiveRate} | Ton: {effectivePitch} | Nefes: {enableNaturalCadence ? `${pauseMs}ms` : "Standart"}
          </span>
        </div>

        {/* Ayarları Kaydetme (Presets) */}
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          <label className="block text-xs font-bold text-slate-200">
            💾 Bu Ses Ayarlarını İsimlendirip Kaydet
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Örn: Benim Sakin Lamba Anlatımım"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleSavePreset}
              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shrink-0"
            >
              💾 Kaydet
            </button>
          </div>

          {/* Kayıtlı Ayarlar Listesi */}
          {savedPresets.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-slate-400">
                Kayıtlı Özel Ses Ayarlarınız ({savedPresets.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {savedPresets.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleLoadPreset(p)}
                      className="font-semibold text-indigo-300 hover:text-white transition text-left"
                      title="Bu ayarı yükle"
                    >
                      📌 {p.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePreset(p.id)}
                      className="text-slate-500 hover:text-rose-400 transition ml-1"
                      title="Sil"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 text-sm text-rose-300">
          {error}
        </p>
      )}

      {/* Seslendir Butonu */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg"
      >
        {loading ? "Ses Üretiliyor (1-2 Saniye)..." : "🔊 MP3 Olarak Seslendir (0 Kredi)"}
      </button>

      {/* Ses Oynatıcı & MP3 İndirme Butonu */}
      {audioUrl && (
        <div className="rounded-xl border border-emerald-500/30 bg-slate-950 p-4 space-y-3">
          <p className="text-sm font-bold text-emerald-300 flex items-center gap-2">
            <span>🎉</span> Seslendirmeniz Hazır! (Aşağıdaki oynatıcıdan dinleyebilir veya MP3 olarak indirebilirsiniz)
          </p>
          <audio controls autoPlay key={audioUrl} src={audioUrl} className="w-full h-10" />
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={audioUrl}
              download="emel-ahmet-seslendirme.mp3"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md"
            >
              <span>⬇️</span> Bilgisayara İndir (MP3 Dosyası)
            </a>
          </div>
        </div>
      )}
    </form>
  );
}
