import { supabaseServer } from "@/lib/supabase/server";

export async function getProfile() {
  const supabase = supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: prof } = await supabase
    .from("profiles")
    .select("id,email,role,full_name")
    .eq("id", auth.user.id)
    .single();

  return prof ?? null;
}

export async function getSessionWithCase(sessionId: string) {
  const supabase = supabaseServer();
  const { data: session } = await supabase
    .from("case_sessions")
    .select("id,case_id,status,current_stage_index,final_score,started_at,finished_at,critical_flags")
    .eq("id", sessionId)
    .single();

  if (!session) return null;

  const { data: c } = await supabase
    .from("cases")
    .select("id,title,theme,difficulty,tags")
    .eq("id", session.case_id)
    .single();

  return { session, case: c };
}

export async function getStage(caseId: string, stageIndex: number) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("case_stages")
    .select("stage_index,title,content,question,max_score")
    .eq("case_id", caseId)
    .eq("stage_index", stageIndex)
    .single();
  return data ?? null;
}
