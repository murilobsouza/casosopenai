import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/queries";

export default async function AlunoPage() {
  const supabase = supabaseServer();
  const prof = await getProfile();

  const { data: sessions } = await supabase
    .from("case_sessions")
    .select("id,status,final_score,started_at,finished_at,case_id")
    .order("started_at", { ascending: false })
    .limit(20);

  return (
    <div className="card">
      <nav>
        <Link href="/">Home</Link>
        <a href="/logout">Sair</a>
        {prof?.role === "admin" && <Link href="/professor">Painel do Professor</Link>}
      </nav>

      <h1>Painel do Aluno</h1>
      <p className="small">Logado como: {prof?.email}</p>

      <form action="/api/casos/random" method="post">
        <button className="btn" type="submit">Iniciar Caso Aleatório</button>
      </form>

      <hr />
      <h2>Histórico (últimas 20 sessões)</h2>
      <div className="small">
        {(sessions ?? []).map((s) => (
          <div key={s.id} className="card" style={{marginTop:10}}>
            <div><span className="badge">{s.status}</span> &nbsp; Score: <b>{s.final_score}</b></div>
            <div>Início: {new Date(s.started_at).toLocaleString("pt-BR")}</div>
            {s.finished_at && <div>Fim: {new Date(s.finished_at).toLocaleString("pt-BR")}</div>}
            <div style={{marginTop:8}}>
              <Link className="btn secondary" href={`/aluno/caso?session=${s.id}`}>Abrir</Link>
            </div>
          </div>
        ))}
      </div>

      <p className="small" style={{marginTop:16}}>
        Uso educacional. Não substitui supervisão médica.
      </p>
    </div>
  );
}
