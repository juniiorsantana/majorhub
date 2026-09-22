# Manter o Supabase acordado

O plano Free do Supabase pausa o projeto depois de **7 dias sem atividade**. Quando isso
acontece, o Content Hub e o portal do cliente param de responder até alguém restaurar o
projeto no painel.

## Por que não dá para resolver dentro do banco

Quem decide pausar é a plataforma do Supabase, olhando requisições que chegam de fora
(API REST, Auth, conexões). Um trigger no Postgres ou um job de `pg_cron` roda dentro da
instância e **não conta como atividade** — o projeto pausa do mesmo jeito. Por isso o ping
precisa ser uma chamada externa.

## Como está montado

| Peça | Arquivo | Papel |
| --- | --- | --- |
| Tabela do heartbeat | `supabase/migrations/202609220001_keep_alive.sql` | Uma linha só (`id = 1`) com `last_ping_at` e `ping_count`. O ping é update, nunca insert, então a tabela não cresce. |
| Função do ping | mesma migration, `public.touch_keep_alive()` | `security definer`, com execute liberado **apenas** para `service_role`. |
| Rota | `src/app/api/cron/keep-alive/route.ts` | `GET` protegido por `CRON_SECRET`, chama a função com a chave service_role. |
| Agendamento | `vercel.json` | Cron diário às 09:00 UTC (06:00 em Brasília). |

RLS fica ligado na tabela e **sem nenhuma policy**: `anon` e `authenticated` não leem nem
escrevem nada ali. Só a `service_role`, que ignora RLS, encosta na tabela.

## Configuração

1. Aplique a migration `202609220001_keep_alive.sql`.
2. Gere um segredo: `openssl rand -hex 32`.
3. Na Vercel, em **Settings → Environment Variables**, crie `CRON_SECRET` com esse valor
   (marque Production; o cron só roda em Production).
4. Faça o deploy. O cron aparece em **Settings → Cron Jobs** do projeto.

> No plano Hobby da Vercel o cron roda **uma vez por dia** e o disparo acontece dentro da
> hora marcada, não no minuto exato. Para o janela de 7 dias isso é folgado.

## Conferir se está funcionando

Pelos logs da Vercel: procure por `[keep-alive] ok`.

Pelo banco:

```sql
select last_ping_at, ping_count, source from public.keep_alive;
```

Teste manual (o `CRON_SECRET` é o mesmo da Vercel):

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" https://SEU-DOMINIO/api/cron/keep-alive
```

Resposta esperada: `{"ok":true,"lastPingAt":"...","pingCount":N}`.

## Se o projeto já estiver pausado

O ping **não** traz um projeto pausado de volta — a restauração é manual, em
**supabase.com → projeto → Restore**. Depois que ele volta, o cron segura daí em diante.
