import { NextResponse } from "next/server";
import OpenAI from "openai";
import { AIFeedbackSchema } from "@/lib/ai/schemas";
import { buildSystemPrompt } from "@/lib/ai/tutorPrompt";

export const runtime = "nodejs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  const body = await req.json();
  const { stageText, stageQuestion, studentText } = body ?? {};

  if (!stageText || !stageQuestion || !studentText) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const system = buildSystemPrompt();
  const input = `
ETAPA ATUAL (dados liberados):
${stageText}

PERGUNTA DA ETAPA:
${stageQuestion}

RESPOSTA DO ALUNO:
${studentText}

Responda no JSON do schema.
`.trim();

  const r = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input,
    instructions: system,
  });

  const text = (r.output_text || "").trim();
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  const raw = jsonStart >= 0 && jsonEnd > jsonStart ? text.slice(jsonStart, jsonEnd + 1) : text;

  let obj: any;
  try {
    obj = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "AI output not JSON", raw: text.slice(0, 4000) }, { status: 500 });
  }

  const parsed = AIFeedbackSchema.safeParse(obj);
  if (!parsed.success) {
    return NextResponse.json({ error: "AI output invalid", details: parsed.error.flatten(), raw: obj }, { status: 500 });
  }

  return NextResponse.json(parsed.data);
}
