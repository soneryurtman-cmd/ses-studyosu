"use client";

import { useRef, useState } from "react";

type Props = {
  configured: boolean;
  onCloned: () => void;
};

export default function VoiceCloner({ configured, onCloned }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Kayıt durumu
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `kayit-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        setFiles((prev) => [...prev, file]);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Mikrofona erişilemedi. Tarayıcı izinlerini kontrol edin.");
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name.trim()) return setError("Ses adı gerekli.");
    if (files.length === 0) return setError("En az bir ses örneği ekleyin.");

    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", name.trim());
      form.append("description", description.trim());
      files.forEach((f) => form.append("files", f, f.name));

      const res = await fetch("/api/voices", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Klonlama başarısız.");

      setSuccess(`"${name}" başarıyla klonlandı! Artık konuşma üretebilirsin.`);
      setName("");
      setDescription("");
      setFiles([]);
      onCloned();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl"
    >
      <h2 className="text-lg font-semibold text-white">Yeni Ses Klonla</h2>
      <p className="mt-1 text-sm text-slate-400">
        Net ve gürültüsüz 30 saniye–1 dakikalık bir örnek en iyi sonucu verir.
      </p>
      <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
        ℹ️ Kendi sesini klonlamak, ElevenLabs&apos;in ücretli planını (Starter ~$5/ay)
        gerektirir. Ücretsiz kullanmak için &quot;Hazır Sesler&quot; sekmesini
        kullanabilirsin.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Ses adı
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Benim Sesim"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Açıklama (opsiyonel)
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Örn. Sıcak, sakin erkek sesi"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
        </div>

        {/* Kayıt & yükleme */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-700 bg-slate-950 p-4">
            <p className="text-sm font-medium text-slate-300">Mikrofonla kaydet</p>
            {!recording ? (
              <button
                type="button"
                onClick={startRecording}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-500"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-white" /> Kaydı başlat
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600"
              >
                <span className="h-2.5 w-2.5 animate-pulse rounded-sm bg-rose-400" />
                Durdur ({seconds}s)
              </button>
            )}
          </div>

          <label className="flex cursor-pointer flex-col justify-center rounded-lg border border-dashed border-slate-600 bg-slate-950 p-4 text-center hover:border-indigo-500">
            <span className="text-sm font-medium text-slate-300">
              Dosya yükle
            </span>
            <span className="mt-1 text-xs text-slate-500">
              mp3, wav, m4a, webm
            </span>
            <input
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
        </div>

        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-sm"
              >
                <span className="truncate text-slate-200">🎵 {f.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="ml-3 shrink-0 text-slate-400 hover:text-rose-400"
                >
                  Kaldır
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {success}
          </p>
        )}
        {!configured && (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
            ⚠️ ELEVENLABS_API_KEY ayarlanmamış. Klonlama için bir ElevenLabs API
            anahtarı ekleyin.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Klonlanıyor…" : "Sesi Klonla"}
        </button>
      </div>
    </form>
  );
}
