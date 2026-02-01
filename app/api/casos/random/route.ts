import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const supabase = supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: cases } = await supabase
    .from("cases")
    .select("id,title,theme,difficulty,tags")
    .eq("is_active", true);

  if (!cases?.length) return NextResponse.json({ error: "no cases" }, { status: 400 });

  const { data: hist } = await supabase
    .from("student_case_history")
    .select("case_id")
    .eq("student_id", auth.user.id);

  const done = new Set((hist ?? []).map((h) => h.case_id));
  const notDone = cases.filter((c) => !done.has(c.id));
  const pool = notDone.length >= Math.max(1, Math.floor(cases.length * 0.3)) ? notDone : cases;

  const pick = pool[Math.floor(Math.random() * pool.length)];

  const { data: session, error } = await supabase
    .from("case_sessions")
    .insert({ student_id: auth.user.id, case_id: pick.id })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.redirect(new URL(`/aluno/caso?session=${session!.id}`, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}
