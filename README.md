# SolarDados BR

Plataforma de dados e simuladores de energia solar para o mercado brasileiro.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **Prisma ORM**
- **Supabase** (PostgreSQL)

## Como rodar

```bash
pnpm install
cp .env.example .env.local   # preencher variáveis
pnpm dev
```

## Variáveis de ambiente

| Variável              | Descrição                          |
| --------------------- | ---------------------------------- |
| `DATABASE_URL`        | Connection string Supabase (pooled)|
| `DIRECT_URL`          | Connection string Supabase (direta)|
| `NEXT_PUBLIC_GA_ID`   | Google Analytics Measurement ID    |
| `RESEND_API_KEY`      | Chave API Resend (e-mail)          |
| `GOOGLE_MAPS_API_KEY` | Chave API Google Maps              |
