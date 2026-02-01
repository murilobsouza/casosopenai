"use client";

import { useEffect, useMemo, useState } from "react";

type Stage = {
  stage_index: number;
  title: string;
  content: string;
  question: string;
  max_score: number;
};

export default function CasePage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const sessionId = params.get("session");

  const [loading, setLoading] = useState(true);
  const [caseTitle, setCaseTitle] = useState<string>("");
  const [caseTheme, setCaseTheme] = useState<string>("");
  const [stageIndex, setStageIndex] = useState<number>(1);
  const [stage, setStage] = useState<Stage | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [status, setStatus] = useState<string>("in_progress");
  const [finalScore, setFinalScore] = useState<number>(0);
  const [totalStages, setTotalStages] = useState<number>(5);

  async function load() {
    if (!sessionId) return;
    setLoading(true);
    const r = await fetch("/api/session/get", { method: "POST", body: JSON.stringify({ sessionId }) });
    const j = await r.json();
    setCaseTitle(j.case?.title ?? "");
    setCaseTheme(j.case?.theme ?? "");
    setStageIndex(j.session?.current_stage_index ?? 1);
    setStatus(j.session?.status ?? "in_progress");
    setFinalScore(j.session?.final_score ?? 0);
    setTotalStages(j.totalStages ?? 5);
    setStage(j.stage ?? null);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function onSend() {
    if (!sessionId || !stage) return;

    setFeedback(null);

    // 1) chama IA
    const aiRes = await fetch("/api/ai/etapa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stageText: stage.content,
        stageQuestion: stage.question,
        studentText: answer
      })
    });
    const ai = await aiRes.json();
    setFeedback(ai);

    // 2) registra e avança
    const advRes = await fetch("/api/session/advance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, stageIndex: stage.stage_index, studentText: answer, ai })
    });
    const adv = await advRes.json();
    if (!advRes.ok) {
      alert(adv.error || "Erro ao registrar.");
      return;
    }
    setAnswer("");
    await load();
  }

  if (!sessionId) {
    return <div className="card">Sessão não informada.</div>;
  }

  if (loading) return <div className="card">Carregando...</div>;

  return (
    <div className="card">
      <div className="small">
        <a href="/aluno">← voltar</a>
      </div>

      <h1>Caso: {caseTitle}</h1>
      <p className="small">Tema: {caseTheme}</p>

      <div className="badge">Etapa {stageIndex}/{totalStages}</div>
      <div className="badge" style={{marginLeft:8}}>Status: {status}</div>
      <div className="badge" style={{marginLeft:8}}>Score atual: {finalScore}</div>

      <hr />

      {stage ? (
        <>
          <h2>{stage.title}</h2>
          <p className="small"><b>Dados liberados:</b></p>
          <pre className="card">{stage.content}</pre>

          <p className="small"><b>Pergunta:</b> {stage.question}</p>

          {status !== "completed" ? (
            <>
              <textarea className="input" style={{minHeight:120}} value={answer} onChange={(e)=>setAnswer(e.target.value)} placeholder="Digite sua resposta..." />
              <div style={{height:12}}/>
              <button className="btn" onClick={onSend} disabled={!answer.trim()}>Enviar</button>
            </>
          ) : (
            <p className="small"><b>Este caso já foi concluído.</b></p>
          )}

          {feedback && (
            <div className="card" style={{marginTop:16}}>
              <h3>Feedback da etapa</h3>
              <div className="small"><b>Score:</b> {feedback.score} — {feedback.justification}</div>
              <hr />
              <pre>{feedback.feedback}</pre>
              {feedback.next_hint && (
                <>
                  <hr />
                  <div className="small"><b>Dica (sem spoiler):</b> {feedback.next_hint}</div>
                </>
              )}
              {feedback.unsafe_flag && (
                <p className="small" style={{color:"crimson"}}><b>Alerta:</b> conduta potencialmente insegura/urgente.</p>
              )}
              <p className="small"><i>Uso educacional. Não substitui supervisão médica.</i></p>
            </div>
          )}

        </>
      ) : (
        <p className="small">Não foi possível carregar a etapa.</p>
      )}
    </div>
  );
}
