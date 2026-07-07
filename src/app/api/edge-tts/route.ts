import { EdgeTTS } from "node-edge-tts";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawText = String(body?.text || "").trim();
    const voice = String(body?.voice || "tr-TR-EmelNeural").trim();
    const rate = String(body?.rate || "+0%").trim();
    const pitch = String(body?.pitch || "+0Hz").trim();

    if (!rawText) {
      return Response.json(
        { error: "Lütfen seslendirilecek bir metin girin." },
        { status: 400 }
      );
    }

    if (rawText.length > 5000) {
      return Response.json(
        { error: "Metin en fazla 5000 karakter olabilir." },
        { status: 400 }
      );
    }

    // Cümle aralarına ve sonlarına doğal okunabilirlik için noktalama düzenlemesi
    let cleanText = rawText;
    cleanText = cleanText.replace(/\s+/g, " ");
    cleanText = cleanText.replace(/([.,!?:;])([a-zA-Z0-9çğıöşüÇĞİÖŞÜ])/g, "$1 $2");

    const tmpPath = path.join(
      os.tmpdir(),
      `edge_tts_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`
    );

    const lang = voice.startsWith("tr") ? "tr-TR" : "en-US";

    const tts = new EdgeTTS({
      voice: voice || "tr-TR-EmelNeural",
      lang,
      outputFormat: "audio-24khz-48kbitrate-mono-mp3",
      rate: rate || "+0%",
      pitch: pitch || "+0Hz",
      timeout: 15000,
    });

    await tts.ttsPromise(cleanText, tmpPath);

    const buffer = fs.readFileSync(tmpPath);

    // Geçici dosyayı sil
    try {
      fs.unlinkSync(tmpPath);
    } catch {
      // sessizce geç
    }

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="emel-ahmet-seslendirme-${Date.now()}.mp3"`,
      },
    });
  } catch (err) {
    console.error("Edge TTS Hatası:", err);
    return Response.json(
      { error: "Ses üretilirken bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
