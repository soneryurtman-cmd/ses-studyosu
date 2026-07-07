import { listVoices, ElevenLabsError } from "@/lib/elevenlabs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const voices = await listVoices();
    return Response.json({ voices });
  } catch (err) {
    if (err instanceof ElevenLabsError) {
      return Response.json({ error: err.message, voices: [] }, { status: err.status });
    }
    console.error(err);
    return Response.json(
      { error: "Sesler alınamadı.", voices: [] },
      { status: 500 }
    );
  }
}
