import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function SessoesPage() {
  const supabase = supabaseServer();
  const { data: sessions } = await supabase
    .from("case_sessions")
    .select("id,student_id,case_id,status,final_score,started_at,finished_at,critical_flags")
    .order("started_at", { ascending: false })
    .limit(200);

  return (
    <div className="card">
      <nav><Link href="/professor">← voltar</Link></nav>
      <h1>Sessões (últimas 200)</h1>
      <div className="small">
        {(sessions ?? []).map((s) => (
          <div key={s.id} className="card" style={{marginTop:10}}>
            <div><span className="badge">{s.status}</span> &nbsp; Score: <b>{s.final_score}</b> &nbsp; Flags: {s.critical_flags}</div>
            <div>Início: {new Date(s.started_at).toLocaleString("pt-BR")}</div>
            {s.finished_at && <div>Fim: {new Date(s.finished_at).toLocaleString("pt-BR")}</div>}
            <div className="small">Session ID: {s.id}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
