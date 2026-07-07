import { isConfigured } from "@/lib/elevenlabs";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ configured: isConfigured() });
}
