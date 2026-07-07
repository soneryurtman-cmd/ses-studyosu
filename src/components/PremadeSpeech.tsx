"use client";

import { useEffect, useState } from "react";
import type { PremadeVoice } from "@/lib/elevenlabs";
import { voiceSummaryTr } from "@/lib/voiceLabels";

// Anlatım tarzı ön ayarları
type Style = {
  key: string;
  label: string;
  emoji: string;
  stability: number;
  similarity: number;
  hint: string;
};

const STYLES: Style[] = [
  {
    key: "narrator",
    label: "Anlatıcı",
    emoji: "🎬",
    stability: 0.6,
    similarity: 0.8,
    hint: "Dengeli, akıcı anlatım. Genel videolar için ideal.",
  },
  {
    key: "cheerful",
    label: "Neşeli",
    emoji: "😊",
    stability: 0.3,
    similarity: 0.75,
    hint: "Canlı ve enerjik. Ünlem işaretleri kullanmayı unutma!",
  },
  {
    key: "energetic",
    label: "Enerjik",
    emoji: "📢",
    stability: 0.2,
    similarity: 0.7,
    hint: "Coşkulu ve heyecanlı. Tanıtım/giriş bölümleri için.",
  },
  {
    key: "surprised",
    label: "Şaşkın",
    emoji: "😲",
    stability: 0.25,
    similarity: 0.7,
    hint: "İnişli çıkışlı, meraklı. 'Vay canına!', 'İnanılmaz!' gibi ifadeler ekle.",
  },
  {
    key: "calm",
    label: "Sakin",
    emoji: "😌",
    stability: 0.8,
    similarity: 0.8,
    hint: "Durağan ve huzurlu. Adım adım tarif anlatımı için.",
  },
  {
    key: "serious",
    label: "Ciddi",
    emoji: "🎙️",
    stability: 0.85,
    similarity: 0.85,
    hint: "Tutarlı ve bilgilendirici. Ciddi/resmi anlatım için.",
  },
];

export default function PremadeSpeech() {
  const [voices, setVoices] = useState<PremadeVoice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [voicesError, setVoicesError] = useState<string | null>(null);

  const [selected, setSelected] = useState<string>("");
  const [useCustomId, setUseCustomId] = useState<boolean>(false);
  const [customVoiceId, setCustomVoiceId] = useState<string>("");

  const [text, setText] = useState("");
  const [styleKey, setStyleKey] = useState<string>("narrator");
  const [stability, setStability] = useState(0.6);
  const [similarity, setSimilarity] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/premade-voices")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setVoicesError(d.error);
        const list: PremadeVoice[] = d.voices ?? [];
        
        // Ücretsiz uyumlu varsayılan (premade) sesleri en başa al
        const sortedList = [...list].sort((a, b) => {
          const aIsPremade = a.category === "premade";
          const bIsPremade = b.category === "premade";
          if (aIsPremade && !bIsPremade) return -1;
          if (!aIsPremade && bIsPremade) return 1;
          return a.name.localeCompare(b.name);
        });

        setVoices(sortedList);
        
        // Ücretsiz uyumlu ilk premade sesi varsayılan olarak seç
        const firstFreeVoice = sortedList.find((v) => v.category === "premade") || sortedList[0];
        if (firstFreeVoice) setSelected(firstFreeVoice.voiceId);
      })
      .catch(() => setVoicesError("Sesler yüklenemedi."))
      .finally(() => setLoadingVoices(false));
  }, []);

  const current = voices.find((v) => v.voiceId === selected);
  const activeStyle = STYLES.find((s) => s.key === styleKey);

  function applyStyle(s: Style) {
    setStyleKey(s.key);
    setStability(s.stability);
    setSimilarity(s.similarity);
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const targetVoiceId = useCustomId
      ? customVoiceId.trim()
      : selected;

    if (!targetVoiceId) {
      return setError(
        useCustomId
          ? "Lütfen özel ses kodunu (Voice ID) girin."
          : "Lütfen listeden bir ses seçin."
      );
    }
    if (!text.trim()) return setError("Seslendirilecek metni girin.");

    setLoading(true);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elevenVoiceId: targetVoiceId,
          voiceName: useCustomId
            ? "Özel Ses"
            : current?.name || "Hazır ses",
          text: text.trim(),
          stability,
          similarity,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Üretim başarısız.");
      }
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={generate}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl"
    >
      <h2 className="text-lg font-semibold text-white">
        Hazır Seslerle Anlatım{" "}
        <span className="ml-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
          Ücretsiz
        </span>
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Profesyonel hazır seslerden birini seç veya özel Türkçe ses kodunu
        yapıştırarak metnini seslendir.
      </p>

      {loadingVoices ? (
        <p className="mt-6 text-sm text-slate-400">Sesler yükleniyor…</p>
      ) : voicesError ? (
        <p className="mt-6 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          ⚠️ {voicesError}
          <br />
          <span className="text-amber-200/80">
            ELEVENLABS_API_KEY doğru ayarlandığından emin olun.
          </span>
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          {/* Ses Seçim Tipi */}
          <div className="flex items-center justify-between rounded-lg bg-slate-950 p-2 border border-slate-800">
            <button
              type="button"
              onClick={() => setUseCustomId(false)}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                !useCustomId
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Listeden Ses Seç ({voices.length})
            </button>
            <button
              type="button"
              onClick={() => setUseCustomId(true)}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                useCustomId
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🔑 Özel Ses Kodu (Voice ID) Yapıştır
            </button>
          </div>

          {!useCustomId ? (
            /* Listeden Ses Seçimi */
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Ses Seç
              </label>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              >
                {voices.map((v) => {
                  const summary = voiceSummaryTr(v.labels);
                  const isPremade = v.category === "premade";
                  const badge = isPremade ? "✅ Ücretsiz Uyumlu" : "⚠️ Kütüphane Sesi";
                  return (
                    <option key={v.voiceId} value={v.voiceId}>
                      [{badge}] {v.name}
                      {summary ? ` — ${summary}` : ""}
                    </option>
                  );
                })}
              </select>
              {current && (
                <div className="mt-2 space-y-1">
                  {voiceSummaryTr(current.labels) && (
                    <p className="text-xs text-slate-400">
                      🏷️ {voiceSummaryTr(current.labels)}
                    </p>
                  )}
                  {current.category === "premade" ? (
                    <p className="text-xs text-emerald-400 font-medium">
                      ✅ Bu ses ElevenLabs varsayılan sesidir, ücretsiz planda API ile sorunsuz çalışır.
                    </p>
                  ) : (
                    <p className="text-xs text-amber-300 font-medium bg-amber-500/10 p-2 rounded-lg">
                      ⚠️ Bu ses bir ElevenLabs Kütüphane sesidir. ElevenLabs kuralları gereği kütüphane sesleri ücretsiz API ile çalışmaz. Lütfen sorunsuz seslendirme için <b>[✅ Ücretsiz Uyumlu]</b> etiketli sesleri seçin (örn. Bella, Rachel, Adam, Antoni vb.).
                    </p>
                  )}
                </div>
              )}
              {current?.previewUrl && (
                <div className="mt-2">
                  <p className="mb-1 text-xs text-slate-500">Ses önizlemesi:</p>
                  <audio
                    key={current.voiceId}
                    controls
                    src={current.previewUrl}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Özel Voice ID Yapıştırma */
            <div className="space-y-2 rounded-xl border border-indigo-500/30 bg-slate-950/80 p-4">
              <label className="block text-sm font-medium text-white">
                ElevenLabs Özel Ses Kodu (Voice ID)
              </label>
              <input
                type="text"
                value={customVoiceId}
                onChange={(e) => setCustomVoiceId(e.target.value)}
                placeholder="Örn: 21m00Tcm4TlvDq8ikWAM veya Emel / Ayşe ses kodu..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              />
              <p className="text-xs text-slate-400 leading-relaxed">
                💡 <b>İpucu:</b> <a href="https://elevenlabs.io" target="_blank" rel="noreferrer" className="text-indigo-400 underline">elevenlabs.io</a> adresinde <b>Voice Library</b> sekmesinden beğendiğin &quot;Emel&quot;, &quot;Ayşe&quot; gibi herhangi bir sesin kodunu buraya yapıştırabilirsin! Ya da hesabına eklediğinde sol sekmedeki listede otomatik çıkar.
              </p>
            </div>
          )}

          {/* Anlatım tarzı */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Anlatım Tarzı
            </label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {STYLES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => applyStyle(s)}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition ${
                    styleKey === s.key
                      ? "border-indigo-500 bg-indigo-600/20 text-white"
                      : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <span className="text-lg">{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
            {activeStyle && (
              <p className="mt-2 rounded-lg bg-slate-800/50 px-3 py-2 text-xs text-slate-300">
                💡 {activeStyle.hint}
              </p>
            )}
          </div>

          {/* Metin */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Metin
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              maxLength={5000}
              placeholder="Seslendirmek istediğin metni buraya yaz…"
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {text.length}/5000
            </p>
          </div>

          {/* İnce ayar (gelişmiş) */}
          <details className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium text-slate-400">
              ⚙️ İnce ayar (isteğe bağlı)
            </summary>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 flex justify-between text-sm font-medium text-slate-300">
                  <span>Kararlılık</span>
                  <span className="text-slate-500">{stability.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={stability}
                  onChange={(e) => setStability(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Düşük = daha duygusal · Yüksek = daha durağan
                </p>
              </div>
              <div>
                <label className="mb-1 flex justify-between text-sm font-medium text-slate-300">
                  <span>Benzerlik</span>
                  <span className="text-slate-500">{similarity.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={similarity}
                  onChange={(e) => setSimilarity(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Sesin aslına ne kadar sadık kalacağı
                </p>
              </div>
            </div>
          </details>

          {error && (
            <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Üretiliyor…" : "🔊 Seslendir"}
          </button>

          {audioUrl && (
            <div className="rounded-lg border border-slate-700 bg-slate-950 p-4">
              <p className="mb-2 text-sm font-medium text-emerald-300">
                Hazır! 🎉
              </p>
              <audio controls src={audioUrl} className="w-full" />
              <a
                href={audioUrl}
                download="ses.mp3"
                className="mt-3 inline-block text-sm text-indigo-400 hover:text-indigo-300"
              >
                ⬇️ İndir (mp3)
              </a>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
