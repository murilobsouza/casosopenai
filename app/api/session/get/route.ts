import { NextResponse } from "next/server";
import { getSessionWithCase, getStage } from "@/lib/db/queries";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "missing sessionId" }, { status: 400 });

  const supabase = supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sc = await getSessionWithCase(sessionId);
  if (!sc) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: countData } = await supabase
    .from("case_stages")
    .select("id", { count: "exact", head: true })
    .eq("case_id", sc.case.id);

  const totalStages = (countData as any)?.count ?? 5;

  const stage = await getStage(sc.case.id, sc.session.current_stage_index);

  return NextResponse.json({ session: sc.session, case: sc.case, stage, totalStages });
}
