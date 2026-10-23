import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { DEMO_SESSION_COOKIE, isDemoMode, verifyDemoSession } from "@/lib/session";
import { isProtectedPath } from "@/lib/auth/paths";
import { supabaseConfig } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();

  if (isDemoMode()) {
    const token = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
    const session = await verifyDemoSession(token);
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const { configured, url, anonKey } = supabaseConfig();
  if (!configured) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url as string, anonKey as string, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirectResponse = NextResponse.redirect(redirectUrl);
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest).*)",
  ],
};
