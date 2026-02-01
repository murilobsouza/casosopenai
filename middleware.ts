import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => cookies.forEach((c) => res.cookies.set(c.name, c.value, c.options)),
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;

  if (!data.user && (path.startsWith("/aluno") || path.startsWith("/professor"))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (data.user && path.startsWith("/professor")) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (prof?.role !== "admin") return NextResponse.redirect(new URL("/aluno", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/aluno/:path*", "/professor/:path*"],
};
