# 🚀 Amigo Edu Backend

> Backend robusto para a plataforma **Amigo Edu**, focado em gestão de indicações, cálculo de impacto social/financeiro e gamificação de usuários.

Este projeto é uma **API RESTful** desenvolvida em **Node.js** com arquitetura **MVC + Services**, utilizando **PostgreSQL** para persistência de dados. O sistema gerencia todo o ciclo de vida do usuário, desde a autenticação segura até a progressão de níveis baseada em metas e indicações.

---

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura do Projeto](#-arquitetura-do-projeto)
- [Pré-requisitos e Instalação](#-pré-requisitos-e-instalação)
- [Configuração (.env)](#-configuração-de-ambiente)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Testes](#-testes)
- [Endpoints Principais](#-endpoints-principais)

---

## ✨ Funcionalidades

### 🔐 Autenticação e Segurança
- **Login Seguro:** Autenticação via **JWT (JSON Web Token)**.
- **Controle de Acesso:** Diferenciação entre perfis `User` e `Admin`.
- **Proteção:**
  - **Rate Limiting:** Proteção contra ataques de força bruta e DDoS.
  - **Sanitização:** Validação rigorosa de dados de entrada (`express-validator`).
  - **Criptografia:** Senhas hashadas com `bcryptjs`.

### 🎮 Gamificação e Engajamento
- **Sistema de Níveis:** Usuários ganham pontos e sobem de nível ao atingir metas.
- **Metas Dinâmicas:** Desafios (diários, semanais, mensais) que recompensam o usuário.
- **Ranking:** Classificação de usuários por desempenho (Global, Mensal, Semanal).

### 📈 Impacto e Indicações
- **Gestão de Indicações:** Ciclo completo de indicação (criação -> validação -> recompensa).
- **Cálculo de Impacto:** Lógica complexa que calcula renda gerada e bolsas concedidas em tempo real.
- **Feedback Financeiro:** Verificação automática de elegibilidade para saque de recompensas.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído com uma stack moderna e focada em performance e manutenção:

- **Core:** `Node.js` (v18+), `Express`
- **Banco de Dados:** `PostgreSQL`, `Sequelize` (ORM)
- **Segurança:** `BCrypt`, `JWT`, `Express Rate Limit`, `CORS`
- **Validação:** `Express Validator`
- **Testes:** `Jest` (Unitários e Integração)
- **Utilitários:** `Dotenv`, `Nodemon`

---

## 🏗️ Arquitetura do Projeto

O código segue o padrão **MVC (Model-View-Controller)** estendido com uma camada de **Services**, garantindo separação de responsabilidades e regras de negócio limpas.

Utilizamos a seguinte organização de pastas:

```tree
src/
├── controllers/    # Camada de requisições: Recebe e envia dados, chama Services.
├── services/       # Camada de Negócio: Contém a lógica complexa (Gamificação, Impacto, Metas).
├── models/         # Definição das tabelas e relacionamentos via Sequelize.
├── routes/         # Definição e agrupamento de todas as rotas da API.
├── middlewares/    # Funções que rodam antes dos Controllers (Auth, Rate Limiter, Validadores).
├── utils/          # Funções auxiliares (Formatadores de CPF/Telefone, Helpers para Metas).
├── database/       # Configuração da conexão com PostgreSQL/Sequelize e sync.
├── app.js          # Configuração principal do Express e aplicação dos middlewares globais.
└── server.js       # Ponto de entrada do servidor (configura variáveis de ambiente e inicia).
```
---

## ⚙️ Pré-requisitos e Instalação

### 1. Pré-requisitos
- **Node.js** instalado (Recomendado v18 ou superior)
- **PostgreSQL** rodando localmente ou na nuvem (ex: Render, Supabase, Neon)

### 2. Instalação

```bash
# Clone o repositório
git clone https://github.com/limaamorim/Proleduca_Backend

# Entre na pasta
cd Proleduca_Backend

# Instale as dependências
npm install
```
---

## 🔐 Configuração de Ambiente##
- Crie um arquivo .env na raiz do projeto seguindo o exemplo abaixo:

```bash
# Servidor
PORT=3000

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=nome_do_banco

# Segurança (JWT)
JWT_SECRET=sua_chave_super_secreta
JWT_EXPIRES=1d

```
---

## 📡 Testar Conexão com Banco

Ao iniciar, o servidor faz a verificação automática da conexão com o PostgreSQL.  
Se estiver tudo certo, você verá no console:

```
✅ CONEXÃO COM POSTGRES ESTABELECIDA COM SUCESSO!
Servidor rodando em http://localhost:3000
```
---

## 📜 Scripts Disponíveis
- No terminal, você pode executar os seguintes comandos:

```bash
comando             descrição
npm run dev	        #Inicia o servidor em modo de desenvolvimento (com Nodemon)

npm start	        #Inicia o servidor em modo de produção

npm run sync-db	    #Sincroniza os modelos do Sequelize com o Banco de Dados

npm test	        #Executa a suíte de testes com Jest

npm run test:       #coverage Gera relatório de cobertura de testes

```

## 🌐 Endpoints Principais
Abaixo estão listadas as rotas principais da API. <br>

Nota: A maioria das rotas exige o cabeçalho Authorization: Bearer <token>. <br>

## 👤 Autenticação & Usuários
`POST /api/v1/auth/login` - Login (User e Admin)

`POST /api/v1/usuarios` - Cadastro de Usuário

`GET /api/v1/usuarios/:id` - Perfil detalhado (inclui gamificação e impacto)

## 🎯 Gamificação & Metas
`GET /api/v1/gamificacao/usuario/:id` - Ver nível e pontos

`GET /api/v1/metas` - Listar metas disponíveis

`GET /api/v1/metas/usuario/:id` - Ver progresso nas metas

## 🤝 Indicações
`POST /api/v1/indicacoes` - Criar nova indicação

`GET /api/v1/indicacoes` - Listar indicações

`POST /api/v1/indicacoes/:id/validar` - (Admin) Validar indicação e gerar recompensas

## 🏆 Ranking
`GET /api/v1/ranking/semanal` - Ranking da semana

`GET /api/v1/ranking/todos` - Ranking global

## 🛡️ Administração
`GET /api/v1/admins/usuario` - Gestão completa de usuários

`PATCH /api/v1/admins/usuario/:id/suspender` - Suspender contas

`PUT /api/v1/config/:chave` - Ajustar parâmetros do sistema (ex: valor da recompensa)

---

## 🔗 Integração com o Backend
Este repositório trabalha em conjunto com o frontend:  
👉 [AmigoEdu-frontend](https://github.com/Juh-MM/AmigoEdu-frontend)

---

## 👨‍💻 Equipe
- Frontend: Cauã Souza, Glewbber Júnior, Júlia Martins e Thymos Victor  
- Backend: Felipe Ricardo(QA e Dev), Fernando(Dev) e João Italo(Dev e Banco)  
- UI/UX: Cauã Souza, Júlia Martins e Thymos Victor  
- Stakeholders: [ProlEduca](https://www.proleduca.com.br/)
