import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function CasosPage() {
  const supabase = supabaseServer();
  const { data: cases } = await supabase
    .from("cases")
    .select("id,title,theme,difficulty,tags,is_active,updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="card">
      <nav>
        <Link href="/professor">← voltar</Link>
      </nav>
      <h1>Casos</h1>
      <div className="row">
        <Link className="btn" href="/professor/casos/novo">Criar novo caso</Link>
      </div>
      <hr />
      <div className="small">
        {(cases ?? []).map((c) => (
          <div key={c.id} className="card" style={{marginTop:10}}>
            <div><b>{c.title}</b> <span className="badge">{c.theme}</span> <span className="badge">D{c.difficulty}</span></div>
            <div className="small">Tags: {(c.tags ?? []).join(", ")}</div>
            <div className="small">Ativo: {String(c.is_active)}</div>
            <div style={{marginTop:8}}>
              <Link className="btn secondary" href={`/professor/casos/${c.id}`}>Editar</Link>
            </div>
          </div>
        ))}
      </div>

      <hr />
      <h2>Importação em massa</h2>
      <p className="small">Envie JSON no formato: array de casos com stages (ver README).</p>
      <form action="/api/casos/import" method="post" encType="application/json">
        <textarea className="input" style={{minHeight:140}} name="payload" placeholder='[{"title":"...","theme":"...","difficulty":2,"tags":["córnea"],"stages":[{"stage_index":1,"title":"Etapa 1","content":"...","question":"...","max_score":2}]}]'></textarea>
        <div style={{height:12}}/>
        <button className="btn" type="submit">Importar JSON</button>
      </form>
    </div>
  );
}
