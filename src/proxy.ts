import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, expectedToken } from "@/lib/auth";

// Kimlik doğrulama gerektirmeyen yollar
const PUBLIC_PATHS = ["/login", "/api/login", "/api/health"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const valid = token && token === (await expectedToken());

  if (valid) {
    return NextResponse.next();
  }

  // API isteklerinde JSON 401 dön
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  // Sayfalarda giriş ekranına yönlendir
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  // _next statik dosyaları ve favicon hariç her şeyi kapsa
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
