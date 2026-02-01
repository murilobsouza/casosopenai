import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

function csvEscape(v: any) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export async function GET() {
  const supabase = supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: prof } = await supabase.from("profiles").select("role").eq("id", auth.user.id).single();
  if (prof?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data: sessions } = await supabase
    .from("case_sessions")
    .select("id,student_id,case_id,status,final_score,started_at,finished_at,critical_flags");

  const { data: attempts } = await supabase
    .from("stage_attempts")
    .select("session_id,stage_index,attempt_no,student_text,ai_score,ai_justification,unsafe_flag,created_at");

  const header = [
    "session_id","student_id","case_id","status","final_score","started_at","finished_at","critical_flags",
    "stage_index","attempt_no","student_text","ai_score","ai_justification","unsafe_flag","attempt_created_at"
  ];

  const bySession = new Map<string, any[]>();
  (attempts ?? []).forEach((a) => {
    const arr = bySession.get(a.session_id) ?? [];
    arr.push(a);
    bySession.set(a.session_id, arr);
  });

  const lines = [header.join(",")];

  (sessions ?? []).forEach((s) => {
    const arr = bySession.get(s.id) ?? [null];
    for (const a of arr) {
      const row = [
        s.id, s.student_id, s.case_id, s.status, s.final_score, s.started_at, s.finished_at ?? "", s.critical_flags,
        a?.stage_index ?? "", a?.attempt_no ?? "", a?.student_text ?? "", a?.ai_score ?? "", a?.ai_justification ?? "", a?.unsafe_flag ?? "", a?.created_at ?? ""
      ].map(csvEscape);
      lines.push(row.join(","));
    }
  });

  const csv = lines.join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=sessoes.csv",
    },
  });
}
