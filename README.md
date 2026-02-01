# Tutor de Casos Clínicos – Oftalmologia

Projeto Next.js (App Router) + Supabase (Auth + Postgres) + OpenAI (backend).

## Como rodar local

1) Copie `.env.example` para `.env.local` e preencha as chaves:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `OPENAI_API_KEY` (server-only)

2) Instale e rode:
```bash
npm install
npm run dev
```

## Banco de dados (Supabase)
No Supabase SQL Editor, cole o arquivo `supabase/schema.sql`.

> Para criar um usuário admin:
- crie uma conta normalmente (Register)
- no Supabase SQL Editor execute:
```sql
update public.profiles set role='admin' where email='SEU_EMAIL';
```

## Deploy na Vercel
- Configure as mesmas env vars em Project Settings > Environment Variables (Preview + Production)
- Faça redeploy.

## Aviso
Uso educacional. Não substitui supervisão médica.
