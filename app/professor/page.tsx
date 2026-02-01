import Link from "next/link";
import { getProfile } from "@/lib/db/queries";

export default async function ProfessorPage() {
  const prof = await getProfile();

  return (
    <div className="card">
      <nav>
        <Link href="/aluno">Painel do Aluno</Link>
        <a href="/logout">Sair</a>
      </nav>
      <h1>Painel do Professor/Admin</h1>
      <p className="small">Logado como: {prof?.email}</p>

      <div className="row">
        <Link className="btn" href="/professor/casos">Casos</Link>
        <Link className="btn secondary" href="/professor/alunos">Alunos</Link>
        <Link className="btn secondary" href="/professor/sessoes">Sessões</Link>
        <a className="btn secondary" href="/api/export/sessoes">Exportar CSV</a>
      </div>
    </div>
  );
}
