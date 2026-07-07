const BASE_URL = "https://api.elevenlabs.io/v1";

export function getApiKey(): string | null {
  return process.env.ELEVENLABS_API_KEY || null;
}

export function isConfigured(): boolean {
  return Boolean(getApiKey());
}

export class ElevenLabsError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function requireKey(): string {
  const key = getApiKey();
  if (!key) {
    throw new ElevenLabsError(
      "ELEVENLABS_API_KEY yapılandırılmamış. Lütfen ortam değişkenlerine ekleyin.",
      501
    );
  }
  return key;
}

/**
 * Instant Voice Cloning — ses örneklerinden yeni bir ses oluşturur.
 * Returns the ElevenLabs voice_id.
 */
export async function cloneVoice(
  name: string,
  description: string,
  files: File[]
): Promise<string> {
  const key = requireKey();
  const form = new FormData();
  form.append("name", name);
  if (description) form.append("description", description);
  for (const file of files) {
    form.append("files", file, file.name || "sample.mp3");
  }

  const res = await fetch(`${BASE_URL}/voices/add`, {
    method: "POST",
    headers: { "xi-api-key": key },
    body: form,
  });

  if (!res.ok) {
    const detail = await safeErrorMessage(res);
    throw new ElevenLabsError(detail, res.status);
  }

  const data = (await res.json()) as { voice_id: string };
  return data.voice_id;
}

export type PremadeVoice = {
  voiceId: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  previewUrl: string | null;
};

/**
 * ElevenLabs hesabındaki mevcut sesleri listeler (hazır/premade sesler dahil).
 * Ücretsiz planda da çalışır.
 */
export async function listVoices(): Promise<PremadeVoice[]> {
  const key = requireKey();
  const res = await fetch(`${BASE_URL}/voices`, {
    headers: { "xi-api-key": key },
  });

  if (!res.ok) {
    const detail = await safeErrorMessage(res);
    throw new ElevenLabsError(detail, res.status);
  }

  const data = (await res.json()) as {
    voices: Array<{
      voice_id: string;
      name: string;
      category?: string;
      labels?: Record<string, string>;
      preview_url?: string;
    }>;
  };

  return (data.voices || []).map((v) => ({
    voiceId: v.voice_id,
    name: v.name,
    category: v.category || "premade",
    labels: v.labels || {},
    previewUrl: v.preview_url || null,
  }));
}

/**
 * Text-to-speech — bir sesle metni seslendirir. Ses (mp3) buffer'ı döner.
 */
export async function textToSpeech(
  voiceId: string,
  text: string,
  opts?: { stability?: number; similarity?: number; modelId?: string }
): Promise<ArrayBuffer> {
  const key = requireKey();
  const res = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: opts?.modelId || "eleven_multilingual_v2",
      voice_settings: {
        stability: opts?.stability ?? 0.5,
        similarity_boost: opts?.similarity ?? 0.75,
      },
    }),
  });

  if (!res.ok) {
    const detail = await safeErrorMessage(res);
    throw new ElevenLabsError(detail, res.status);
  }

  return res.arrayBuffer();
}

export async function deleteVoice(voiceId: string): Promise<void> {
  const key = requireKey();
  const res = await fetch(`${BASE_URL}/voices/${voiceId}`, {
    method: "DELETE",
    headers: { "xi-api-key": key },
  });
  // 404 kabul edilebilir (zaten yok)
  if (!res.ok && res.status !== 404) {
    const detail = await safeErrorMessage(res);
    throw new ElevenLabsError(detail, res.status);
  }
}

async function safeErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    const d = data?.detail;
    let msg = "";
    if (typeof d === "string") msg = d;
    else if (d?.message) msg = d.message;
    else if (data?.message) msg = data.message;
    else msg = `ElevenLabs hatası (${res.status})`;

    // Ücretsiz hesaplarda kütüphane sesi hatası Türkçeleştirme
    if (
      msg.includes("cannot use library voices") ||
      msg.includes("Free users cannot use") ||
      msg.includes("upgrade your subscription")
    ) {
      return "⚠️ Seçtiğiniz ses bir ElevenLabs Kütüphane Sesi olduğu için ücretsiz planda API üzerinden kullanılamaz. Lütfen listedeki '✅ Ücretsiz Uyumlu' işaretli varsayılan seslerden birini (örn. Bella, Rachel, Antoni, Adam) seçin.";
    }

    return msg;
  } catch {
    return `ElevenLabs hatası (${res.status})`;
  }
}
