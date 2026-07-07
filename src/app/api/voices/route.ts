import { db } from "@/db";
import { voices } from "@/db/schema";
import { desc } from "drizzle-orm";
import { cloneVoice, ElevenLabsError } from "@/lib/elevenlabs";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(voices).orderBy(desc(voices.createdAt));
  return Response.json({ voices: rows });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const description = String(form.get("description") || "").trim();
    const files = form
      .getAll("files")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (!name) {
      return Response.json({ error: "Ses adı gerekli." }, { status: 400 });
    }
    if (files.length === 0) {
      return Response.json(
        { error: "En az bir ses örneği yükleyin." },
        { status: 400 }
      );
    }

    const voiceId = await cloneVoice(name, description, files);

    const [row] = await db
      .insert(voices)
      .values({
        elevenLabsVoiceId: voiceId,
        name,
        description,
        sampleName: files.map((f) => f.name).join(", "),
      })
      .returning();

    return Response.json({ voice: row }, { status: 201 });
  } catch (err) {
    if (err instanceof ElevenLabsError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return Response.json(
      { error: "Ses klonlanırken beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
