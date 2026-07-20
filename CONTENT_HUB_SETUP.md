# Content Hub — configuração

O módulo de aprovação usa o Supabase já configurado no projeto.

## 1. Aplicar as migrations

Execute, em ordem, os arquivos da pasta `supabase/migrations`. A migration mais recente,
`202607200004_content_approval_workflow.sql`, adiciona cronogramas, versões e as funções
seguras usadas pelo link público.

## 2. Chave exclusiva do servidor

Adicione ao `.env.local` e ao ambiente da Vercel:

```env
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

Essa chave é usada apenas no backend para criar URLs temporárias das imagens depois que
o token de aprovação é validado. Nunca use o prefixo `NEXT_PUBLIC_` e nunca envie essa
chave para o navegador.

## 3. Fluxo de uso

1. Entre em `/admin` e acesse **Clientes & Posts**.
2. Cadastre um cliente e crie um cronograma.
3. Adicione as publicações e envie cada uma para aprovação.
4. Na pasta do cliente, gere o link do cronograma e envie ao contato responsável.

Os links expiram em 30 dias. Gerar um novo link para o mesmo cronograma revoga o anterior.
