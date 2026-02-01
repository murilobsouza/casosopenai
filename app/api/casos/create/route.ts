import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: prof } = await supabase.from("profiles").select("role").eq("id", auth.user.id).single();
  if (prof?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { title, theme, difficulty } = await req.json();
  if (!title || !theme) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const { data: c, error } = await supabase
    .from("cases")
    .insert({ title, theme, difficulty: Number(difficulty) || 1, tags: [], is_active: true, created_by: auth.user.id })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // cria 5 etapas placeholder
  const stages = [1,2,3,4,5].map((i)=>({
    case_id: c!.id,
    stage_index: i,
    title: `Etapa ${i}`,
    content: i===1 ? "Apresentação inicial: (preencha aqui)." : "Conteúdo da etapa (preencha aqui).",
    question: i===1 ? "Quais hipóteses diagnósticas iniciais?" : "Responda à pergunta desta etapa.",
    max_score: 2
  }));
  await supabase.from("case_stages").insert(stages);

  return NextResponse.json({ id: c!.id });
}
