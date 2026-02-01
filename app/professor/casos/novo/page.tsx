"use client";

import { useState } from "react";

export default function NovoCasoPage() {
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("Córnea");
  const [difficulty, setDifficulty] = useState(2);
  const [msg, setMsg] = useState<string | null>(null);

  async function onCreate() {
    setMsg(null);
    const r = await fetch("/api/casos/create", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ title, theme, difficulty })
    });
    const j = await r.json();
    if (!r.ok) return setMsg(j.error || "Erro");
    window.location.href = `/professor/casos/${j.id}`;
  }

  return (
    <div className="card">
      <div className="small"><a href="/professor/casos">← voltar</a></div>
      <h1>Novo caso</h1>

      <label className="small">Título</label>
      <input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} />
      <div style={{height:10}}/>

      <label className="small">Tema</label>
      <input className="input" value={theme} onChange={(e)=>setTheme(e.target.value)} />
      <div style={{height:10}}/>

      <label className="small">Dificuldade (1-5)</label>
      <input className="input" type="number" min={1} max={5} value={difficulty} onChange={(e)=>setDifficulty(Number(e.target.value))} />
      <div style={{height:16}}/>

      <button className="btn" onClick={onCreate} disabled={!title.trim()}>Criar</button>
      {msg && <p className="small" style={{color:"crimson"}}>{msg}</p>}
    </div>
  );
}
