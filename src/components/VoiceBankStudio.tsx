"use client";

import { useRef, useState } from "react";

type RecordedClip = {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  duration: number; // saniye cinsinden
  category: string;
};

type ScriptPrompt = {
  category: string;
  title: string;
  text: string;
  hint: string;
};

const SCRIPTS: ScriptPrompt[] = [
  {
    category: "Su Kabağı Anlatımı",
    title: "Atölyeye Giriş & Hazırlık",
    text: "Merhaba, bugün su kabağı lambası yapımında en çok merak edilen aşamalardan birini, yani delme ve boncuk yerleştirme tekniklerini göstereceğim. Kabağın kabuğu çok sert olduğu için matkabı sabit tutmak ve acele etmemek çok önemlidir.",
    hint: "Doğal, sakin ve öğretici bir tonda oku.",
  },
  {
    category: "Su Kabağı Anlatımı",
    title: "Duygusal & Sanatsal Vurgu",
    text: "Bir su kabağına dokunduğunuzda aslında doğanın bize sunduğu eşsiz bir tuale dokunursunuz. İçine ışığı koyup karanlık bir odada yaktığımız o ilk an... İşte bütün o yorgunluğun unutturulduğu, gölgelerin duvarda dans ettiği o büyüleyici an.",
    hint: "Sıcak, biraz duygusal ve huzurlu bir tonda seslendir.",
  },
  {
    category: "Heyecan & Neşe",
    title: "Sonucu Gösterme Anı",
    text: "Vay canına! Şunun güzelliğine bakar mısınız? Işıkları kapattığım an duvara yansıyan şu desenler tek kelimeyle muazzam oldu! Harika değil mi? Siz de kendi evinizde bu büyülü ortamı yaratabilirsiniz!",
    hint: "İnişli çıkışlı, neşeli, coşkulu ve gülümseyerek konuş.",
  },
  {
    category: "Masal & Hikaye",
    title: "Loş Atölye Hikayesi",
    text: "Güneş yavaşça tepelerin ardında kaybolurken, eski ahşap masanın üzerinde duran su kabakları sessizce kendi sırasını bekliyordu. Usta derin bir nefes aldı, eline ince ucu aldı ve ilk motifi işlemeye başladı. Gece uzun, sanat ise sabır işiydi.",
    hint: "Bir sesli kitap veya masal anlatır gibi tane tane ve gizemli oku.",
  },
  {
    category: "Şarkı & Tını Pratiği (RVC İçin)",
    title: "Uzun Vokaller & Ses Genişliği",
    text: "Aaaaaaa... Eeeeeee... Ooooooo... Uuuuuuu... La la la la la! Günler geçti, mevsimler döndü, ışık hiç sönmedi. (Burada birkaç saniye melodik mırıldanma veya en sevdiğin şarkıdan 2 kıta söyleyebilirsin).",
    hint: "Şarkı söyleyen AI'ın (RVC) sesindeki iniş çıkışları ve notaları öğrenmesi için şarkı söyler gibi tonlu oku.",
  },
  {
    category: "Net Diksiyon",
    title: "Hızlı & Keskin Harfler",
    text: "Sanatçı, sabırla, sevgiyle ve sükunetle çalışır. Tekrar eden motifler, titiz ellerde kusursuz bir simetriye dönüşür. Her bir delik, karanlığa açılan yeni bir ışık penceresidir.",
    hint: "Harfleri (s, t, k, p, r) çok net ve keskin çıkararak diksiyonlu oku.",
  },
];

export default function VoiceBankStudio() {
  const [clips, setClips] = useState<RecordedClip[]>([]);
  const [selectedScriptIndex, setSelectedScriptIndex] = useState(0);
  const [customName, setCustomName] = useState("");

  // Kayıt durumları
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeScript = SCRIPTS[selectedScriptIndex];

  // Toplam süre hesaplama (saniye)
  const totalSeconds = clips.reduce((acc, c) => acc + c.duration, 0);
  const totalMinutes = (totalSeconds / 60).toFixed(1);
  const targetSeconds = 600; // 10 dakika = 600 saniye
  const progressPercent = Math.min(100, Math.round((totalSeconds / targetSeconds) * 100));

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const name = customName.trim() || `${activeScript.category} - Kayıt ${clips.length + 1}`;
        const duration = recordingSeconds || 1; // en az 1 sn

        setClips((prev) => [
          {
            id: String(Date.now()),
            name,
            blob,
            url,
            duration,
            category: activeScript.category,
          },
          ...prev,
        ]);
        setCustomName("");
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch {
      alert("Mikrofona erişilemedi. Lütfen tarayıcı izinlerini kontrol edin.");
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function deleteClip(id: string) {
    setClips((prev) => prev.filter((c) => c.id !== id));
  }

  // Dosya yükleme (dışarıdan hazır kayıt eklemek isterse)
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        setClips((prev) => [
          {
            id: String(Date.now() + Math.random()),
            name: file.name.replace(/\.[^/.]+$/, ""),
            blob: file,
            url,
            duration: Math.round(audio.duration) || 30,
            category: "Yüklenen Dosya",
          },
          ...prev,
        ]);
      };
    });
  }

  return (
    <div className="space-y-8">
      {/* Üst Bilgi & Altın Hedef Barı */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <span>🎙️</span> Dijital İkiz Ses Bankası Stüdyosu
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Şarkı ve hikaye anlatan yapay zekan için 5-10 dakikalık temiz ses kütüphaneni burada oluştur.
            </p>
          </div>
          <div className="rounded-xl bg-slate-900/80 px-4 py-3 text-center border border-slate-800">
            <span className="text-xs text-slate-400 block">TOPLAM KAYIT</span>
            <span className="text-2xl font-black text-indigo-400">{totalMinutes} / 10.0</span>
            <span className="text-xs text-slate-400 block">Dakika</span>
          </div>
        </div>

        {/* İlerleme Çubuğu */}
        <div className="mt-6">
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-400">Başlangıç (0 dk)</span>
            <span className="text-amber-400">Minimum Konuşma (3 dk)</span>
            <span className="text-emerald-400">Şarkı & RVC İçin Altın Hedef (10 dk 🏆)</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-950 p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-right text-xs text-slate-400">
            Hedefin {progressPercent}% tamamlandı! {totalSeconds >= 180 ? "🎉 Minimum seviyeyi geçtin!" : "Birkaç kayıt daha ekleyelim."}
          </p>
        </div>
      </div>

      {/* Kayıt Alanı ve Senaryolar */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sol: Senaryo Seçimi */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">📖 Ne Okuyacağım? (Hazır Senaryolar)</h3>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {SCRIPTS.map((script, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedScriptIndex(idx)}
                className={`w-full text-left rounded-xl border p-3.5 transition ${
                  selectedScriptIndex === idx
                    ? "border-indigo-500 bg-indigo-600/20 shadow-md"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                    {script.category}
                  </span>
                  <span className="text-xs text-slate-500">Senaryo #{idx + 1}</span>
                </div>
                <p className="mt-1.5 text-sm font-bold text-white">{script.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{script.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Sağ: Aktif Okuma Kartı & Mikrofon */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-semibold text-indigo-400">{activeScript.category}</span>
                <h3 className="text-lg font-bold text-white">{activeScript.title}</h3>
              </div>
              <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                💡 {activeScript.hint}
              </span>
            </div>

            {/* Okunacak Metin */}
            <div className="mt-5 rounded-xl border border-slate-700/80 bg-slate-950 p-5 shadow-inner">
              <p className="text-base font-medium leading-relaxed text-slate-100 select-all">
                &quot;{activeScript.text}&quot;
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Kayıt Adı (İsteğe bağlı özelleştir)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`${activeScript.title} - Kayıt...`}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Kayıt Butonları */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
            {!recording ? (
              <button
                type="button"
                onClick={startRecording}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-rose-500 transition active:scale-[0.98]"
              >
                <span className="h-3 w-3 rounded-full bg-white animate-pulse" />
                🎙️ Bu Metni Kaydetmeye Başla
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-rose-500/50 px-5 py-3.5 text-sm font-bold text-white hover:bg-slate-700 transition"
              >
                <span className="h-3 w-3 rounded-sm bg-rose-500 animate-ping" />
                ⏹️ Kaydı Durdur ({recordingSeconds} saniye)
              </button>
            )}

            <label className="flex items-center justify-center gap-2 cursor-pointer rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-xs font-medium text-slate-300 hover:border-slate-500 transition">
              <span>📁 Hazır Dosya Yükle</span>
              <input
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Kaydedilen Sesler Listesi */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🗂️</span> Ses Kütüphanem ({clips.length} Parça)
            </h3>
            <p className="text-xs text-slate-400">
              Bu sesleri bilgisayarına indirip RVC, GPT-SoVITS veya ElevenLabs ile sınırsız kullanabilirsin.
            </p>
          </div>
        </div>

        {clips.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center">
            <p className="text-3xl">📭</p>
            <p className="mt-2 text-sm font-medium text-slate-300">Henüz hiç ses kaydetmedin</p>
            <p className="text-xs text-slate-500 mt-1">Yukarıdan bir senaryo seç ve kayda başla!</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                      {clip.category}
                    </span>
                    <p className="mt-1 font-bold text-sm text-white truncate max-w-[200px] sm:max-w-[250px]">
                      {clip.name}
                    </p>
                    <p className="text-[11px] text-slate-500">Süre: ~{clip.duration} saniye</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={clip.url}
                      download={`${clip.name}.webm`}
                      className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-indigo-300 hover:bg-slate-700 transition"
                      title="Bu parçayı indir"
                    >
                      ⬇️ İndir
                    </a>
                    <button
                      type="button"
                      onClick={() => deleteClip(clip.id)}
                      className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-950/50 transition"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <audio controls src={clip.url} className="mt-3 w-full h-8" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Şarkı ve Sınırsız AI Kurulum Rehberi */}
      <div className="rounded-2xl border border-indigo-500/20 bg-slate-900/40 p-6">
        <h3 className="text-base font-bold text-indigo-300 flex items-center gap-2">
          <span>🚀</span> Aşama 2: Bu Seslerle Şarkı & Hikaye Nasıl Yaptırılır?
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 text-xs text-slate-300 leading-relaxed">
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800/80">
            <h4 className="font-bold text-emerald-400 text-sm mb-1">🎵 Şarkı Söyletmek İçin (RVC / Pinokio)</h4>
            <p className="mb-2">
              Buradan indirdiğin ses parçalarını (toplam ~10 dk) kendi bilgisayarında çalışan ücretsiz bir yapay zekaya bağlayabilirsin:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Bilgisayarına <a href="https://pinokio.computer" target="_blank" className="text-indigo-400 underline">Pinokio</a> (ücretsiz AI yöneticisi) indir.</li>
              <li>İçinden <b>&quot;RVC Applio&quot;</b> veya <b>&quot;XTTS&quot;</b> aracını tek tıkla kur.</li>
              <li>Buradan indirdiğin seslerini programın &quot;Dataset / Train&quot; bölümüne yükle.</li>
              <li>Söyletmek istediğin herhangi bir şarkının mp3&apos;ünü ver ve <b>Convert</b>&apos;e bas!</li>
            </ol>
          </div>

          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800/80">
            <h4 className="font-bold text-amber-400 text-sm mb-1">📖 Hikaye Anlatımı İçin (GPT-SoVITS / ElevenLabs)</h4>
            <p className="mb-2">
              Su kabağı videoların için kendi sesinden sınırsız ve ücretsiz anlatıcı oluşturmak için:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Pinokio üzerinden <b>&quot;GPT-SoVITS&quot;</b> aracını indir (Türkçe konuşmada dünya lideridir).</li>
              <li>Buradan kaydettiğin sadece 1 dakikalık net bir konuşmanı referans olarak ekle.</li>
              <li>İstediğin metni yazıp anında kendi sesinle seslendir!</li>
              <li>Bulutta devam etmek istersen, bu sesleri ElevenLabs Starter planındaki &quot;Voice Cloning&quot; kısmına topluca yükle.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
