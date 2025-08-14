# SportTimePro 🏃‍♂️

Sistema completo de gerenciamento de academias esportivas com agendamento de aulas, vínculo de alunos e professores, e dashboard personalizado por tipo de usuário.

## 🚀 Funcionalidades Principais

- **🏢 Gestão de Academias**: Sistema multi-tenant para academias
- **👨‍🏫 Gestão de Professores**: CRUD completo de professores
- **👨‍🎓 Gestão de Alunos**: Cadastro e vínculo com professores
- **📚 Gestão de Aulas**: Criação, edição e agendamento de aulas
- **📅 Sistema de Agendamentos**: Agendamento e cancelamento de aulas
- **🔗 Vínculo Aluno-Professor**: Sistema de convites e solicitações
- **🎨 Dashboard Personalizado**: Interface específica para cada tipo de usuário
- **📧 Confirmação de E-mail**: Sistema de verificação automática
- **🔐 Autenticação JWT**: Sistema seguro de login e autorização

## 🏗️ Arquitetura

### Backend
- **Node.js** com Express
- **Prisma ORM** para banco de dados
- **PostgreSQL** como banco principal
- **JWT** para autenticação
- **Nodemailer** para envio de e-mails

### Frontend
- **Next.js 14** com App Router
- **React** com TypeScript
- **Tailwind CSS** para estilização
- **Zustand** para gerenciamento de estado
- **Axios** para requisições HTTP

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

## 🚀 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/SportTimePro.git
cd SportTimePro
```

### 2. Configure o Backend
```bash
cd backend
npm install
cp env-exemple .env
# Configure as variáveis no .env
npm run migrate
npm start
```

### 3. Configure o Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Variáveis de Ambiente (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sporttimepro"

# JWT
JWT_SECRET="sua_chave_secreta_jwt"

# Email
EMAIL_USER="seuemail@gmail.com"
EMAIL_PASS="sua_senha_app"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587

# Server
PORT=3000
NODE_ENV=development
```

## 🔑 Autenticação e Autorização

### Sistema de Roles
- **ADMIN**: Acesso total ao sistema
- **PROFESSOR**: Gestão de aulas e agendamentos
- **ALUNO**: Agendamento e visualização de aulas

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "senha": "123456"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "nome": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "roles": ["ADMIN"],
    "clienteId": "uuid"
  }
}
```

## 👤 Usuários e Autenticação

### 1. Informações do Usuário Logado
```http
GET /api/auth/me
Authorization: Bearer TOKEN_JWT
```

**Resposta:**
```json
{
  "id": "uuid",
  "nome": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "roles": ["ADMIN"],
  "clienteId": "uuid",
  "emailConfirmado": true,
  "criadoEm": "2025-08-14T21:56:25.248Z"
}
```

### 2. Registro de Cliente/Academia
```http
POST /api/auth/register-cliente
Content-Type: application/json

{
  "nomeCliente": "Nome da Academia",
  "nomeAdmin": "Nome do Administrador",
  "email": "admin@academia.com",
  "senha": "123456"
}
```

### 3. Registro de Aluno
```http
POST /api/auth/register
Content-Type: application/json

{
  "nome": "Nome do Aluno",
  "email": "aluno@exemplo.com",
  "senha": "123456",
  "academiaId": "uuid_da_academia"
}
```

### 4. Confirmação de E-mail
```http
GET /api/auth/confirm-email?token=TOKEN_DE_CONFIRMACAO
```

## 🏢 Gestão de Academias

### 1. Listar Academias e Professores
```http
GET /api/search-academias?q=nome_academia
```

**Resposta:**
```json
{
  "academias": [
    {
      "academiaId": "uuid",
      "academiaNome": "Nome da Academia",
      "professores": [
        {
          "id": "uuid",
          "nome": "Nome do Professor",
          "email": "professor@exemplo.com",
          "roles": ["PROFESSOR"]
        }
      ]
    }
  ],
  "total": 1
}
```

### 2. Validação de Convite
```http
GET /api/validate-invite?inviteCode=CODIGO&professorId=UUID
```

**Resposta:**
```json
{
  "valid": true,
  "professorNome": "Nome do Professor",
  "clienteId": "uuid",
  "clienteNome": "Nome da Academia",
  "message": "Convite válido"
}
```

## 🔗 Sistema de Vínculo Aluno-Professor

### 1. Criar Solicitação de Vínculo
```http
POST /api/solicitacoes-vinculo
Authorization: Bearer TOKEN_ALUNO
Content-Type: application/json

{
  "professorId": "uuid_do_professor",
  "mensagem": "Gostaria de treinar com você!"
}
```

### 2. Listar Solicitações Recebidas (Professor/Admin)
```http
GET /api/solicitacoes-vinculo
Authorization: Bearer TOKEN_PROFESSOR_OU_ADMIN
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "status": "PENDENTE",
    "mensagem": "Gostaria de treinar com você!",
    "criadoEm": "2025-08-14T21:56:45.051Z",
    "aluno": {
      "id": "uuid",
      "nome": "Nome do Aluno",
      "email": "aluno@exemplo.com"
    },
    "professor": {
      "id": "uuid",
      "nome": "Nome do Professor",
      "email": "professor@exemplo.com"
    }
  }
]
```

### 3. Responder Solicitação de Vínculo
```http
PUT /api/solicitacoes-vinculo/:id/responder
Authorization: Bearer TOKEN_PROFESSOR_OU_ADMIN
Content-Type: application/json

{
  "status": "APROVADA",
  "resposta": "Bem-vindo! Vamos treinar juntos!"
}
```

**Status possíveis:**
- `PENDENTE`: Aguardando aprovação
- `APROVADA`: Vínculo aprovado (cria automaticamente o vínculo)
- `REJEITADA`: Vínculo rejeitado

### 4. Verificar Status do Vínculo (Aluno)
```http
GET /api/solicitacoes-vinculo/status
Authorization: Bearer TOKEN_ALUNO
```

**Resposta:**
```json
{
  "status": "APROVADA",
  "professorNome": "Nome do Professor",
  "academiaNome": "Nome da Academia",
  "mensagem": "Gostaria de treinar com você!",
  "resposta": "Bem-vindo! Vamos treinar juntos!",
  "criadoEm": "2025-08-14T21:56:45.051Z"
}
```

## 👨‍🏫 Gestão de Professores

### 1. Listar Professores (Admin/Professor)
```http
GET /api/professores
Authorization: Bearer TOKEN_ADMIN_OU_PROFESSOR
```

### 2. Listar Professores da Academia (Aluno)
```http
GET /api/professores/academia
Authorization: Bearer TOKEN_ALUNO
```

### 3. Criar Professor
```http
POST /api/professores
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json

{
  "nome": "Nome do Professor",
  "email": "professor@exemplo.com",
  "senha": "123456",
  "roles": ["PROFESSOR"]
}
```

### 4. Atualizar Professor
```http
PUT /api/professores/:id
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json

{
  "nome": "Novo Nome",
  "email": "novo@exemplo.com"
}
```

### 5. Excluir Professor
```http
DELETE /api/professores/:id
Authorization: Bearer TOKEN_ADMIN
```

## 📚 Gestão de Aulas

### 1. Listar Aulas (Admin/Professor)
```http
GET /api/aulas
Authorization: Bearer TOKEN_ADMIN_OU_PROFESSOR
```

### 2. Listar Aulas do Aluno
```http
GET /api/aulas/aluno
Authorization: Bearer TOKEN_ALUNO
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "nome": "FUTEVOLEI",
    "horario": "2025-08-15T10:00:00.000Z",
    "data": "2025-08-15T10:00:00.000Z",
    "local": {
      "nome": "Quadra Principal"
    },
    "professor": {
      "nome": "Nome do Professor"
    }
  }
]
```

### 3. Criar Aula
```http
POST /api/aulas
Authorization: Bearer TOKEN_ADMIN_OU_PROFESSOR
Content-Type: application/json

{
  "modalidade": "FUTEVOLEI",
  "professorId": "uuid",
  "unidadeId": "uuid",
  "localId": "uuid",
  "dataHoraInicio": "2025-08-15T10:00:00Z",
  "dataHoraFim": "2025-08-15T11:00:00Z",
  "vagasTotais": 12
}
```

### 4. Atualizar Aula
```http
PUT /api/aulas/:id
Authorization: Bearer TOKEN_ADMIN_OU_PROFESSOR
Content-Type: application/json

{
  "modalidade": "NATACAO",
  "vagasTotais": 15
}
```

### 5. Excluir Aula
```http
DELETE /api/aulas/:id
Authorization: Bearer TOKEN_ADMIN
```

### 6. Criar Aulas Recorrentes
```http
POST /api/aulas/recorrentes
Authorization: Bearer TOKEN_ADMIN_OU_PROFESSOR
Content-Type: application/json

{
  "modalidade": "FUTEVOLEI",
  "professorId": "uuid",
  "unidadeId": "uuid",
  "localId": "uuid",
  "dataInicio": "2025-08-15",
  "dataFim": "2025-09-15",
  "horaInicio": "10:00",
  "horaFim": "11:00",
  "diasSemana": [1, 3, 5],
  "vagasTotais": 12
}
```

## 📅 Sistema de Agendamentos

### 1. Agendar Aula
```http
POST /api/agendamentos
Authorization: Bearer TOKEN_ALUNO
Content-Type: application/json

{
  "aulaId": "uuid_da_aula"
}
```

### 2. Listar Agendamentos do Aluno
```http
GET /api/agendamentos/aluno
Authorization: Bearer TOKEN_ALUNO
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "status": "ATIVO",
    "aula": {
      "nome": "FUTEVOLEI",
      "dataHoraInicio": "2025-08-15T10:00:00.000Z",
      "dataHoraFim": "2025-08-15T11:00:00.000Z",
      "local": {
        "nome": "Quadra Principal"
      },
      "professor": {
        "nome": "Nome do Professor"
      }
    }
  }
]
```

### 3. Histórico de Agendamentos do Aluno
```http
GET /api/agendamentos/aluno/historico
Authorization: Bearer TOKEN_ALUNO
```

### 4. Cancelar Agendamento
```http
PUT /api/agendamentos/:agendamentoId/cancelar
Authorization: Bearer TOKEN_ALUNO_OU_ADMIN_OU_PROFESSOR
```

### 5. Listar Alunos de uma Aula
```http
GET /api/agendamentos/aula/:aulaId
Authorization: Bearer TOKEN_ADMIN_OU_PROFESSOR
```

## 🏢 Gestão de Unidades e Locais

### 1. Unidades
```http
# Listar
GET /api/unidades
Authorization: Bearer TOKEN_ADMIN

# Criar
POST /api/unidades
Authorization: Bearer TOKEN_ADMIN

# Atualizar
PUT /api/unidades/:id
Authorization: Bearer TOKEN_ADMIN

# Excluir
DELETE /api/unidades/:id
Authorization: Bearer TOKEN_ADMIN
```

### 2. Locais
```http
# Listar
GET /api/locais
Authorization: Bearer TOKEN_ADMIN

# Criar
POST /api/locais
Authorization: Bearer TOKEN_ADMIN

# Atualizar
PUT /api/locais/:id
Authorization: Bearer TOKEN_ADMIN

# Excluir
DELETE /api/locais/:id
Authorization: Bearer TOKEN_ADMIN
```

## 📦 Gestão de Planos

### CRUD Completo de Planos
```http
# Listar
GET /api/planos
Authorization: Bearer TOKEN_ADMIN

# Criar
POST /api/planos
Authorization: Bearer TOKEN_ADMIN

# Atualizar
PUT /api/planos/:planoId
Authorization: Bearer TOKEN_ADMIN

# Excluir
DELETE /api/planos/:planoId
Authorization: Bearer TOKEN_ADMIN
```

## 🎨 Dashboards Personalizados

### Dashboard do Aluno
- **Navegação Lateral**: Menu com 5 seções principais
- **Seções**:
  - 🏠 **Início**: Status do vínculo + cards informativos
  - 📚 **Aulas**: Lista de aulas agendadas
  - 👥 **Professores**: Lista de professores da academia
  - 📅 **Agendamentos**: Agendamentos ativos
  - 📋 **Histórico**: Histórico de agendamentos
- **Responsivo**: Funciona perfeitamente em desktop e mobile

### Dashboard do Professor/Admin
- **Solicitações de Vínculo**: Gerenciamento de pedidos de alunos
- **Gestão de Aulas**: CRUD completo de aulas
- **Gestão de Agendamentos**: Visualização e controle de agendamentos
- **Estatísticas**: Métricas e resumos da academia

## 🔄 Fluxos Principais

### 1. Cadastro de Aluno
```
1. Aluno acessa /auth/register
2. Preenche dados pessoais
3. Seleciona academia e professor
4. Conta é criada automaticamente
5. Solicitação de vínculo é enviada
6. Professor aprova/rejeita solicitação
7. Vínculo é criado automaticamente após aprovação
```

### 2. Sistema de Convites
```
1. Admin gera código de convite
2. Aluno acessa link com código
3. Validação automática do convite
4. Cadastro com vínculo imediato
5. Redirecionamento para dashboard
```

### 3. Agendamento de Aulas
```
1. Aluno visualiza aulas disponíveis
2. Seleciona aula desejada
3. Sistema verifica disponibilidade
4. Agendamento é criado
5. Confirmação é enviada
```

## ⚙️ Cron Jobs

### Atualização Automática de Agendamentos
- **Frequência**: A cada hora (0 * * * *)
- **Função**: Atualiza status de agendamentos para `CONCLUIDO` quando a aula termina
- **Arquivo**: `backend/src/jobs/cronConcluirAulas.js`

## 📧 Sistema de E-mails

### Configuração SMTP
```env
EMAIL_USER=seuemail@gmail.com
EMAIL_PASS=sua_senha_app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### E-mails Automáticos
- **Confirmação de Cadastro**: Enviado após registro
- **Notificação de Cancelamento**: Enviado quando aula é cancelada
- **Reenvio de Confirmação**: Disponível para usuários não confirmados

## 🔒 Middleware de Autenticação

### Validação de Token JWT
```javascript
// Exemplo de uso
const auth = require('../middlewares/authMiddleware');

// Rota para ADMIN e PROFESSOR
router.get('/rota', auth(['ADMIN', 'PROFESSOR']), controller.method);

// Rota apenas para ADMIN
router.post('/rota', auth(['ADMIN']), controller.method);

// Rota para ALUNO
router.get('/rota', auth(['ALUNO']), controller.method);
```

### Middleware de Tenant
- **Isolamento**: Cada academia só acessa seus próprios dados
- **Segurança**: Prevenção de vazamento de dados entre clientes
- **Automático**: Aplicado em todas as rotas protegidas

## 🚀 Deploy e Produção

### Variáveis de Produção
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="chave_super_secreta_producao"
```

### Comandos de Deploy
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## 🧪 Testes

### Testando Endpoints
```bash
# Testar autenticação
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teste.com","senha":"123456"}'

# Testar com token
curl -X GET "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

## 📊 Status dos Endpoints

| Endpoint | Método | Autenticação | Status |
|----------|--------|---------------|---------|
| `/api/auth/login` | POST | ❌ | ✅ Funcionando |
| `/api/auth/register` | POST | ❌ | ✅ Funcionando |
| `/api/auth/me` | GET | ✅ | ✅ Funcionando |
| `/api/search-academias` | GET | ❌ | ✅ Funcionando |
| `/api/validate-invite` | GET | ❌ | ✅ Funcionando |
| `/api/solicitacoes-vinculo` | POST | ✅ | ✅ Funcionando |
| `/api/solicitacoes-vinculo/status` | GET | ✅ | ✅ Funcionando |
| `/api/professores/academia` | GET | ✅ | ✅ Funcionando |
| `/api/aulas/aluno` | GET | ✅ | ✅ Funcionando |
| `/api/agendamentos/aluno` | GET | ✅ | ✅ Funcionando |

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

- **Email**: suporte@sporttimepro.com
- **Documentação**: [docs.sporttimepro.com](https://docs.sporttimepro.com)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/SportTimePro/issues)

---

**SportTimePro** - Transformando a gestão de academias esportivas! 🏆
