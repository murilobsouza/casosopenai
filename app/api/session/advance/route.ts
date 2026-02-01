import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { sessionId, stageIndex, studentText, ai } = await req.json();
  if (!sessionId || !stageIndex || !studentText || !ai) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const { error: insErr } = await supabase.from("stage_attempts").insert({
    session_id: sessionId,
    stage_index: stageIndex,
    student_text: studentText,
    ai_feedback: ai.feedback,
    ai_score: ai.score,
    ai_justification: ai.justification,
    ai_next_hint: ai.next_hint ?? null,
    unsafe_flag: !!ai.unsafe_flag,
  });

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });

  const { data: sess } = await supabase
    .from("case_sessions")
    .select("id,current_stage_index,final_score,critical_flags,case_id")
    .eq("id", sessionId)
    .single();

  const newScore = (sess?.final_score ?? 0) + (ai.score ?? 0);
  const newFlags = (sess?.critical_flags ?? 0) + (ai.unsafe_flag ? 1 : 0);
  const nextStage = (sess?.current_stage_index ?? 1) + 1;

  const { count } = await supabase
    .from("case_stages")
    .select("*", { count: "exact", head: true })
    .eq("case_id", sess!.case_id);

  const totalStages = count ?? 5;
  const completed = nextStage > totalStages;

  const upd: any = {
    final_score: newScore,
    critical_flags: newFlags,
    current_stage_index: completed ? totalStages : nextStage,
    status: completed ? "completed" : "in_progress",
    finished_at: completed ? new Date().toISOString() : null,
  };

  const { error: updErr } = await supabase
    .from("case_sessions")
    .update(upd)
    .eq("id", sessionId);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

  if (completed) {
    await supabase.from("student_case_history").upsert({
      student_id: auth.user.id,
      case_id: sess!.case_id,
    });
  }

  return NextResponse.json({ ok: true, completed });
}
