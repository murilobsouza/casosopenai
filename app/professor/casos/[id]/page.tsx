import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function EditarCasoPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: c } = await supabase.from("cases").select("*").eq("id", params.id).single();
  const { data: stages } = await supabase
    .from("case_stages")
    .select("*")
    .eq("case_id", params.id)
    .order("stage_index", { ascending: true });

  return (
    <div className="card">
      <nav>
        <Link href="/professor/casos">← voltar</Link>
      </nav>
      <h1>Editar caso</h1>
      <div className="small"><b>{c?.title}</b> — {c?.theme} — D{c?.difficulty}</div>
      <hr />
      <h2>Etapas</h2>
      <p className="small">Para editar etapas rapidamente, use importação JSON nesta versão inicial.</p>
      <pre className="card">{JSON.stringify(stages ?? [], null, 2)}</pre>
    </div>
  );
}
