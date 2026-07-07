import { db } from "@/db";
import { generations } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(generations)
    .orderBy(desc(generations.createdAt))
    .limit(30);
  return Response.json({ generations: rows });
}
