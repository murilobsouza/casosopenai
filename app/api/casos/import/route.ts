import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: prof } = await supabase.from("profiles").select("role").eq("id", auth.user.id).single();
  if (prof?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Forma simples: o textarea envia como JSON puro via request body? Em HTML form, não.
  // Aqui aceitamos JSON no body (recomendado via fetch). Para o form, o Next envia text/plain.
  const text = await req.text();
  let payload: any;
  try {
    // Se veio como "payload=...." tente extrair
    const m = /^payload=(.*)$/s.exec(text);
    const raw = m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : text;
    payload = JSON.parse(raw);
  } catch (e) {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(payload)) return NextResponse.json({ error: "expected array" }, { status: 400 });

  const inserted: string[] = [];

  for (const item of payload) {
    const { title, theme, difficulty, tags, stages } = item ?? {};
    if (!title || !theme || !Array.isArray(stages) || stages.length === 0) continue;

    const { data: c, error } = await supabase
      .from("cases")
      .insert({
        title,
        theme,
        difficulty: Number(difficulty) || 1,
        tags: Array.isArray(tags) ? tags : [],
        is_active: true,
        created_by: auth.user.id,
      })
      .select("id")
      .single();

    if (error) continue;

    const stageRows = stages.map((s: any) => ({
      case_id: c!.id,
      stage_index: Number(s.stage_index),
      title: String(s.title ?? `Etapa ${s.stage_index}`),
      content: String(s.content ?? ""),
      question: String(s.question ?? ""),
      max_score: Number(s.max_score ?? 2),
    }));

    await supabase.from("case_stages").insert(stageRows);
    inserted.push(c!.id);
  }

  return NextResponse.json({ ok: true, insertedCount: inserted.length, inserted });
}
