# SportTimePro
Sistema de Agendamento de Aulas Esportivas.

📘 SportTimePro – API Documentation
📑 Sumário
🔑 Autenticação

📧 Confirmação de E-mail

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

🔒 Validação: Usuário precisa ter emailConfirmado = true para fazer login.

📧 Confirmação de E-mail
Confirmar e-mail
GET /api/auth/confirm-email?token=SEU_TOKEN

Resposta: Confirma o e-mail do usuário.

Token expira em 24 horas após o registro.

Reenviar confirmação
POST /api/auth/resend-confirmation

Body:

json
Copiar
Editar
{
  "email": "usuario@teste.com"
}
Resposta: Reenvia o link de confirmação de e-mail.

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
✅ Envia e-mail automático para confirmação.

Listar alunos do cliente
GET /api/alunos

Headers: Authorization: Bearer TOKEN_ADMIN

🏢 Cliente/Convite
Gerar link de convite
GET /api/client/invite-link

Headers: Authorization: Bearer TOKEN_ADMIN

Regenerar link
POST /api/client/invite-link/regenerate

Desativar link
POST /api/client/invite-link/disable

📦 Planos
CRUD Planos
GET /api/planos

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

Listar aulas disponíveis
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
🔒 Somente usuários com emailConfirmado = true podem agendar.

Cancelar agendamento
PUT /api/agendamentos/:agendamentoId/cancelar

Listar cancelados
GET /api/agendamentos/:aulaId/cancelados

Listar alunos de uma aula
GET /api/agendamentos/aula/:aulaId

Query: status=ATIVO|CANCELADO|CONCLUIDO

Histórico do aluno
GET /api/agendamentos/historico

Headers: Authorization: Bearer TOKEN_ALUNO

⚙️ Cron Jobs
Rodam automaticamente:

Atualizam agendamentos para CONCLUIDO quando a aula termina.

Executados a cada hora (0 * * * *).

📧 Notificações
Ao cancelar uma aula:

Todos os alunos ativos recebem um e-mail automático.

Sistema usa Nodemailer com SMTP configurado no .env:

env
Copiar
Editar
EMAIL_USER=seuemail@gmail.com
EMAIL_PASS=sua_senha
🔒 Middleware
ADMIN: Permissão total.

PROFESSOR: Gerenciamento de aulas e agendamentos.

ALUNO: Agendamento e histórico.

Algumas rotas aceitam múltiplos papéis.
