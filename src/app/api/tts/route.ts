import { db } from "@/db";
import { voices, generations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { textToSpeech, ElevenLabsError } from "@/lib/elevenlabs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = String(body?.text || "").trim();
    const stability =
      typeof body?.stability === "number" ? body.stability : undefined;
    const similarity =
      typeof body?.similarity === "number" ? body.similarity : undefined;

    // İki mod: klonlanmış ses (DB id) veya hazır ses (ham ElevenLabs id)
    const voiceRowId = body?.voiceId != null ? Number(body.voiceId) : null;
    const premadeVoiceId =
      typeof body?.elevenVoiceId === "string" ? body.elevenVoiceId.trim() : "";
    const premadeName =
      typeof body?.voiceName === "string" ? body.voiceName.trim() : "Hazır ses";

    if (!text) {
      return Response.json({ error: "Metin girin." }, { status: 400 });
    }
    if (text.length > 5000) {
      return Response.json(
        { error: "Metin en fazla 5000 karakter olabilir." },
        { status: 400 }
      );
    }

    let targetVoiceId: string;
    let logVoiceRowId: number | null = null;
    let logVoiceName = premadeName;

    if (voiceRowId && Number.isInteger(voiceRowId)) {
      // Klonlanmış ses
      const [voice] = await db
        .select()
        .from(voices)
        .where(eq(voices.id, voiceRowId));
      if (!voice) {
        return Response.json({ error: "Ses bulunamadı." }, { status: 404 });
      }
      targetVoiceId = voice.elevenLabsVoiceId;
      logVoiceRowId = voice.id;
      logVoiceName = voice.name;
    } else if (premadeVoiceId) {
      // Hazır ses (ücretsiz planda çalışır)
      targetVoiceId = premadeVoiceId;
    } else {
      return Response.json({ error: "Ses seçin." }, { status: 400 });
    }

    const audio = await textToSpeech(targetVoiceId, text, {
      stability,
      similarity,
    });

    // Sadece klonlanmış seslerde geçmişe yaz (DB kısıtı gereği)
    if (logVoiceRowId != null) {
      await db.insert(generations).values({
        voiceId: logVoiceRowId,
        voiceName: logVoiceName,
        text,
      });
    }

    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof ElevenLabsError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return Response.json(
      { error: "Konuşma üretilirken hata oluştu." },
      { status: 500 }
    );
  }
}
