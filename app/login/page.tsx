"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMsg(error.message);
    window.location.href = "/aluno";
  }

  return (
    <div className="card">
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <label className="small">Email</label>
        <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <div style={{height:10}}/>
        <label className="small">Senha</label>
        <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <div style={{height:16}}/>
        <button className="btn" type="submit">Entrar</button>
      </form>
      {msg && <p className="small" style={{color:"crimson"}}>{msg}</p>}
      <p className="small">Não tem conta? <a href="/register">Cadastre-se</a></p>
    </div>
  );
}
