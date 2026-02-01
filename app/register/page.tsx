"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function RegisterPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setMsg(error.message);
    setMsg("Cadastro realizado! Você já pode fazer login.");
  }

  return (
    <div className="card">
      <h1>Cadastro</h1>
      <form onSubmit={onSubmit}>
        <label className="small">Email</label>
        <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <div style={{height:10}}/>
        <label className="small">Senha</label>
        <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <div style={{height:16}}/>
        <button className="btn" type="submit">Criar conta</button>
      </form>
      {msg && <p className="small" style={{color: msg.startsWith("Cadastro") ? "green" : "crimson"}}>{msg}</p>}
      <p className="small">Já tem conta? <a href="/login">Entrar</a></p>
    </div>
  );
}
