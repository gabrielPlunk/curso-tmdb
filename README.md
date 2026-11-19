This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Configurar o Supabase (contas e listas)

As contas e as listas "Quero assistir" / "Já assisti" ficam num projeto do Supabase (plano grátis).

1. Crie uma conta em [supabase.com](https://supabase.com) e um projeto novo (guarde a senha do banco num lugar seguro; o site não usa ela).
2. Em **Authentication → Sign In / Providers → Email**, desligue **Confirm email** e salve. Assim quem cria conta já entra na hora, sem esperar e-mail (o plano grátis manda poucos e-mails por hora). Para religar depois, é só voltar nessa mesma chave.
3. Em **Project Settings → API Keys**, copie a **Publishable key**. Em **Project Settings → Data API** (ou na página inicial do projeto), copie a **Project URL**.
4. No arquivo `.env.local` (na raiz do projeto), adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<Project URL>
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Publishable key>
   ```
   Nunca coloque a chave **secret / service_role** aqui.
5. Em **SQL Editor**, cole o conteúdo de `supabase/migrations/0001_marcacoes.sql` e clique em **Run**. Em **Table Editor** deve aparecer a tabela `marcacoes` com o selo **RLS enabled**.
6. Reinicie o `npm run dev`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
