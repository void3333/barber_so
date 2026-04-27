# Barber SO

Aplicação web para gestão de barbearias (clientes, serviços, equipe e agendamentos) com autenticação e dados via Supabase.

## Requisitos

- Node.js 20+
- npm 10+

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```bash
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-chave-anon>
```

Sem essas variáveis, a aplicação lança erro na inicialização do cliente Supabase.

## Scripts

- `npm run dev`: inicia o ambiente de desenvolvimento (Vite).
- `npm run build`: gera build de produção.
- `npm run preview`: sobe preview local da build.
- `npm run lint`: executa ESLint.
- `npm run test`: executa testes unitários com Node Test Runner (`node:test`).

## Desenvolvimento local

```bash
npm install
npm run dev
```

## Qualidade

```bash
npm run lint
npm run test
```
