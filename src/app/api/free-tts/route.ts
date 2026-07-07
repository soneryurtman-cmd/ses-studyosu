import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { enhanceTextWithSSML } from "@/lib/ssmlEnhancer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawText = String(body?.text || "").trim();
    const voice = String(body?.voice || "tr-TR-EmelNeural").trim();

    if (!rawText) {
      return Response.json(
        { error: "Lütfen seslendirilecek bir metin girin." },
        { status: 400 }
      );
    }

    const cleanText = enhanceTextWithSSML(rawText);

    const tts = new MsEdgeTTS();
    await tts.setMetadata(
      voice.includes("Ahmet") ? "tr-TR-AhmetNeural" : "tr-TR-EmelNeural",
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
    );

    const { audioStream } = tts.toStream(cleanText);

    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="free-tts-${Date.now()}.mp3"`,
      },
    });
  } catch (err) {
    console.error("Free TTS error:", err);
    return Response.json(
      { error: "Ses üretilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
