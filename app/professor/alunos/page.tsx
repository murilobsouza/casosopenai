import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AlunosPage() {
  const supabase = supabaseServer();
  const { data: students } = await supabase
    .from("profiles")
    .select("id,email,role,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="card">
      <nav><Link href="/professor">← voltar</Link></nav>
      <h1>Alunos/Usuários</h1>
      <div className="small">
        {(students ?? []).map((u) => (
          <div key={u.id} className="card" style={{marginTop:10}}>
            <div><b>{u.email}</b> <span className="badge">{u.role}</span></div>
            <div>Criado: {new Date(u.created_at).toLocaleString("pt-BR")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
