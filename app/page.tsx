import Link from "next/link";

export default function HomePage() {
  return (
    <div className="card">
      <h1>Tutor de Casos Clínicos – Oftalmologia</h1>
      <p className="small">
        Discussão guiada por IA, por etapas, com registro de desempenho.{" "}
        <b>Uso educacional. Não substitui supervisão médica.</b>
      </p>
      <div className="row">
        <Link className="btn" href="/login">Login</Link>
        <Link className="btn secondary" href="/register">Cadastro</Link>
      </div>
      <hr />
      <p className="small">
        Professores/Admin: após login, acesse o Painel do Professor para cadastrar casos,
        importar em massa e exportar sessões.
      </p>
    </div>
  );
}
