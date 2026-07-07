import { db } from "@/db";
import { voices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteVoice, ElevenLabsError } from "@/lib/elevenlabs";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const voiceId = Number(id);
    if (!Number.isInteger(voiceId)) {
      return Response.json({ error: "Geçersiz kimlik." }, { status: 400 });
    }

    const [row] = await db.select().from(voices).where(eq(voices.id, voiceId));
    if (!row) {
      return Response.json({ error: "Ses bulunamadı." }, { status: 404 });
    }

    try {
      await deleteVoice(row.elevenLabsVoiceId);
    } catch (err) {
      // ElevenLabs tarafı silinemese bile yerel kaydı kaldıralım
      if (!(err instanceof ElevenLabsError)) throw err;
    }

    await db.delete(voices).where(eq(voices.id, voiceId));
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Silme başarısız." }, { status: 500 });
  }
}
