# Arquitetura de acesso por cliente

## Objetivo

Criar uma camada de identidade e permissões para que a equipe da Major Hub e os usuários dos clientes sejam reconhecidos individualmente, sem substituir o portal atual até que o novo fluxo esteja homologado.

## Princípios

- Backend, segurança e testes vêm antes do frontend.
- Toda mudança de banco deve ser aditiva e compatível com a versão atual.
- O portal legado por e-mail continua disponível durante a transição.
- Cada ação relevante deve registrar o usuário autenticado.
- Um usuário pode participar de mais de um cliente.
- A administração de usuários será exclusiva da Major Hub no primeiro ciclo.

## Papéis

| Papel | Escopo inicial |
| --- | --- |
| Major admin | Gerencia clientes, equipe, usuários de clientes, conteúdos e aprovações. |
| Major editor | Gerencia conteúdos e consulta clientes, sem alterar acessos. |
| Cliente admin | Consulta e aprova conteúdos do próprio cliente. A gestão de usuários fica com a Major no MVP. |
| Aprovador | Consulta, aprova e solicita correções. |
| Visualizador | Consulta conteúdos e histórico, sem decidir. |

## Modelo de identidade

- `auth.users` é a fonte da identidade e da sessão por e-mail e senha.
- `team_members` continua vinculando usuários internos à organização Major Hub.
- `client_memberships` vincula um usuário autenticado a um ou mais clientes.
- `client_approvers` permanece como compatibilidade temporária do portal atual.
- `portal_access_events` registra acessos e eventos relevantes.
- `reviews` recebe referências opcionais ao usuário e ao vínculo que realizou a decisão.

## Fluxo de criação do usuário do cliente

1. Um Major admin informa nome, e-mail, cliente, papel e senha temporária.
2. O backend cria o usuário no Supabase Auth com e-mail confirmado.
3. O backend cria o vínculo em `client_memberships` com `must_change_password = true`.
4. O cliente entra com e-mail e senha.
5. Antes de acessar o portal, troca a senha temporária.
6. O acesso e as decisões passam a registrar `auth.uid()`.

## Compatibilidade e liberação

O banco será expandido sem remover campos, policies, cookies ou rotas atuais. O frontend novo será construído apenas depois dos testes de banco, RLS, autenticação e APIs. Em produção, a entrada será controlada por feature flag; a remoção do portal legado será uma etapa posterior.
