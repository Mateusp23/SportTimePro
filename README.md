# SportTimePro
Sistema de Agendamento de Aulas Esportivas.

📘 SportTimePro – API Documentation
📑 Sumário
🔑 Autenticação

👤 Usuários

🏢 Cliente/Convite

📦 Planos

🏢 Unidades e Locais

👨‍🏫 Professores

📚 Aulas

📅 Agendamentos

⚙️ Cron Jobs

📧 Notificações

🔒 Middleware

🔑 Autenticação
Login
POST /api/auth/login

Body:

json
Copiar
Editar
{
  "email": "admin@teste.com",
  "senha": "123456"
}
Resposta: retorna token JWT com roles do usuário.

👤 Usuários
Registrar aluno via convite
POST /api/auth/register-aluno-invite

Body:

json
Copiar
Editar
{
  "nome": "Maria",
  "email": "maria@teste.com",
  "senha": "123456",
  "inviteCode": "abc123"
}
Listar alunos do cliente
GET /api/alunos

Headers: Authorization: Bearer TOKEN_ADMIN

🏢 Cliente/Convite
Gerar link de convite
GET /api/client/invite-link

Headers: Authorization: Bearer TOKEN_ADMIN

Regenerar link de convite
POST /api/client/invite-link/regenerate

Headers: Authorization: Bearer TOKEN_ADMIN

Desativar link
POST /api/client/invite-link/disable

Headers: Authorization: Bearer TOKEN_ADMIN

📦 Planos
CRUD Planos
GET /api/planos → listar

POST /api/planos

PUT /api/planos/:planoId

DELETE /api/planos/:planoId

🏢 Unidades e Locais
CRUD Unidades
GET /api/unidades

POST /api/unidades

CRUD Locais
GET /api/locais

POST /api/locais

👨‍🏫 Professores
CRUD Professores
GET /api/professores

POST /api/professores

📚 Aulas
Criar aula
POST /api/aulas

Body:

json
Copiar
Editar
{
  "modalidade": "FUTEVOLEI",
  "professorId": "uuid",
  "unidadeId": "uuid",
  "localId": "uuid",
  "dataHoraInicio": "2025-08-05T10:00:00Z",
  "dataHoraFim": "2025-08-05T11:00:00Z",
  "vagasTotais": 12
}
Editar aula
PUT /api/aulas/:aulaId

Excluir aula (notifica alunos)
DELETE /api/aulas/:aulaId

Criar aulas recorrentes
POST /api/aulas/recorrentes

Listar aulas
GET /api/aulas

Listar aulas disponíveis para alunos
GET /api/aulas/disponiveis?modalidade=FUTEVOLEI&data=2025-08-04

📅 Agendamentos
Agendar aula
POST /api/agendamentos

Body:

json
Copiar
Editar
{
  "aulaId": "uuid"
}
Cancelar agendamento
PUT /api/agendamentos/:agendamentoId/cancelar

Listar agendamentos cancelados
GET /api/agendamentos/:aulaId/cancelados

Listar alunos de uma aula
GET /api/agendamentos/aula/:aulaId

Query: status=ATIVO|CANCELADO|CONCLUIDO

Histórico do aluno
GET /api/agendamentos/historico

Headers: Authorization: Bearer TOKEN_ALUNO

⚙️ Cron Jobs
Rodam automaticamente:

Atualizam status de agendamentos para CONCLUIDO quando a aula finaliza.

Roda a cada hora (0 * * * *).

📧 Notificações
Quando uma aula é cancelada, todos os alunos ativos recebem um e-mail automático.

🔒 Middleware
ADMIN: Acesso administrativo.

PROFESSOR: Acesso restrito a professores.

ALUNO: Acesso restrito a alunos.

Algumas rotas aceitam múltiplos papéis (ex.: Admin e Professor).
