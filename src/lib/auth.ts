// Basit parola koruması için yardımcılar.
// Parola ortam değişkeninden okunur; ayarlı değilse varsayılan kullanılır.

export const AUTH_COOKIE = "ses_auth";

export function getPassword(): string {
  return process.env.APP_PASSWORD || "sesklon123";
}

// Parola için deterministik bir oturum jetonu üretir (SHA-256).
// Web Crypto hem Node 18+ hem de Edge runtime'da mevcuttur.
export async function computeToken(password: string): Promise<string> {
  const secret = process.env.APP_SECRET || "ses-klonlama-studyosu-secret";
  const data = new TextEncoder().encode(`${password}::${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function expectedToken(): Promise<string> {
  return computeToken(getPassword());
}
