import { AUTH_COOKIE, getPassword, expectedToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = String(body?.password || "");

  if (password !== getPassword()) {
    return Response.json({ error: "Parola yanlış." }, { status: 401 });
  }

  const token = await expectedToken();
  const res = Response.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    `${AUTH_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
      60 * 60 * 24 * 30
    }`
  );
  return res;
}
