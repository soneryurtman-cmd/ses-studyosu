"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Voice, Generation } from "@/db/schema";
import VoiceCloner from "@/components/VoiceCloner";
import SpeechGenerator from "@/components/SpeechGenerator";
import PremadeSpeech from "@/components/PremadeSpeech";
import VoiceBankStudio from "@/components/VoiceBankStudio";
import BrowserSpeech from "@/components/BrowserSpeech";
import BaglamaStudio from "@/components/BaglamaStudio";
import GourdWorkshopAssistant from "@/components/GourdWorkshopAssistant";

type Tab = "workshop" | "browser" | "baglama" | "premade" | "clone" | "generate" | "bank";

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("browser");
  const [configured, setConfigured] = useState(true);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }
  const [voices, setVoices] = useState<Voice[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);

  const loadVoices = useCallback(async () => {
    const res = await fetch("/api/voices");
    const data = await res.json();
    setVoices(data.voices ?? []);
  }, []);

  const loadGenerations = useCallback(async () => {
    const res = await fetch("/api/generations");
    const data = await res.json();
    setGenerations(data.generations ?? []);
  }, []);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setConfigured(Boolean(d.configured)))
      .catch(() => setConfigured(false));
    loadVoices();
    loadGenerations();
  }, [loadVoices, loadGenerations]);

  async function deleteVoice(id: number) {
    if (!confirm("Bu sesi silmek istediğine emin misin?")) return;
    await fetch(`/api/voices/${id}`, { method: "DELETE" });
    loadVoices();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-4 flex justify-end">
        <button
          onClick={logout}
          className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
        >
          Çıkış Yap
        </button>
      </div>
      {/* Başlık */}
      <header className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-3xl shadow-lg">
          🎤
        </div>
        <h1 className="bg-gradient-to-r from-indigo-300 via-white to-fuchsia-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
          Ses Stüdyosu
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
          Su kabağı lambaları, bağlama müzikleri, doğal yapay zeka seslendirmeleri ve ses bankası için hepsi bir arada stüdyo.
        </p>
      </header>

      {/* Sekmeler */}
      <div className="mx-auto mt-8 flex w-fit flex-wrap justify-center gap-1 rounded-full border border-slate-800 bg-slate-900/60 p-1">
        <button
          onClick={() => setTab("workshop")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            tab === "workshop"
              ? "bg-orange-600 text-white shadow-lg font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          🎬 Lamba Senaryo & Atölye 🎃
        </button>
        <button
          onClick={() => setTab("baglama")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            tab === "baglama"
              ? "bg-amber-600 text-white shadow-lg font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          🎸 Bağlama
        </button>
        <button
          onClick={() => setTab("browser")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            tab === "browser"
              ? "bg-indigo-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Emel & Ahmet AI (Sınırsız ♾️)
        </button>
        <button
          onClick={() => setTab("bank")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            tab === "bank"
              ? "bg-indigo-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Ses Bankası 🏆
        </button>
        <button
          onClick={() => setTab("premade")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            tab === "premade"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Hazır Sesler (ElevenLabs) 🆓
        </button>
        <button
          onClick={() => setTab("clone")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            tab === "clone"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Ses Klonla
        </button>
        <button
          onClick={() => setTab("generate")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            tab === "generate"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Konuşma Üret{" "}
          <span className="ml-1 rounded-full bg-slate-700 px-1.5 text-xs">
            {voices.length}
          </span>
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Ana içerik */}
        <div>
          {tab === "workshop" ? (
            <GourdWorkshopAssistant
              onTransferScriptToSpeech={(scriptText) => {
                setTab("browser");
                // LocalStorage veya seslendirme bileşenine metni aktar
                setTimeout(() => {
                  const textarea = document.querySelector("textarea");
                  if (textarea) {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                      window.HTMLTextAreaElement.prototype,
                      "value"
                    )?.set;
                    nativeInputValueSetter?.call(textarea, scriptText);
                    textarea.dispatchEvent(new Event("input", { bubbles: true }));
                  }
                }, 100);
              }}
            />
          ) : tab === "baglama" ? (
            <BaglamaStudio />
          ) : tab === "browser" ? (
            <BrowserSpeech />
          ) : tab === "bank" ? (
            <VoiceBankStudio />
          ) : tab === "premade" ? (
            <PremadeSpeech />
          ) : tab === "clone" ? (
            <VoiceCloner configured={configured} onCloned={loadVoices} />
          ) : (
            <SpeechGenerator voices={voices} onGenerated={loadGenerations} />
          )}
        </div>

        {/* Yan panel */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-sm font-semibold text-white">
              Klonlanmış Sesler
            </h3>
            {voices.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Henüz ses yok.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {voices.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-start justify-between gap-2 rounded-lg bg-slate-800/50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {v.name}
                      </p>
                      {v.description && (
                        <p className="truncate text-xs text-slate-400">
                          {v.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteVoice(v.id)}
                      className="shrink-0 text-xs text-slate-500 hover:text-rose-400"
                    >
                      Sil
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-sm font-semibold text-white">Son Üretimler</h3>
            {generations.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Henüz üretim yok.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {generations.slice(0, 8).map((g) => (
                  <li
                    key={g.id}
                    className="rounded-lg bg-slate-800/50 px-3 py-2"
                  >
                    <p className="text-xs font-medium text-indigo-300">
                      {g.voiceName}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                      {g.text}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <footer className="mt-12 text-center text-xs text-slate-600">
        ElevenLabs API ile çalışır · Yalnızca izniniz olan sesleri klonlayın.
      </footer>
    </main>
  );
}
