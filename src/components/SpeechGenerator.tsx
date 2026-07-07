"use client";

import { useState } from "react";
import type { Voice } from "@/db/schema";

type Props = {
  voices: Voice[];
  onGenerated: () => void;
};

export default function SpeechGenerator({ voices, onGenerated }: Props) {
  const [voiceId, setVoiceId] = useState<number | "">(voices[0]?.id ?? "");
  const [text, setText] = useState("");
  const [stability, setStability] = useState(0.5);
  const [similarity, setSimilarity] = useState(0.75);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // voices güncellenince ilk sesi seç
  const currentValid = voices.some((v) => v.id === voiceId);
  if (!currentValid && voices.length > 0 && voiceId === "") {
    setVoiceId(voices[0].id);
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (voiceId === "") return setError("Bir ses seçin.");
    if (!text.trim()) return setError("Seslendirilecek metni girin.");

    setLoading(true);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceId,
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
      onGenerated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  if (voices.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">
        <p className="text-4xl">🎙️</p>
        <h2 className="mt-3 text-lg font-semibold text-white">
          Henüz klonlanmış ses yok
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Konuşma üretmek için önce &quot;Ses Klonla&quot; sekmesinden bir ses
          ekleyin.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={generate}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl"
    >
      <h2 className="text-lg font-semibold text-white">Konuşma Üret</h2>
      <p className="mt-1 text-sm text-slate-400">
        Klonlanmış bir ses seç ve yazdığın metni seslendir.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Ses
          </label>
          <select
            value={voiceId}
            onChange={(e) => setVoiceId(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

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

        <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
        </div>

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
    </form>
  );
}
