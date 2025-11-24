# 🚀 Amigo Edu Backend

Este é o backend da plataforma **Amigo Edu**, desenvolvido em **Node.js + Express** com **PostgreSQL** e **Sequelize**.  
O objetivo é gerenciar usuários, autenticação e futuras funcionalidades de gamificação.

---

## 🛠️ Tecnologias

- **Node.js** – Ambiente de execução
- **Express** – Framework web para APIs REST
- **Sequelize** – ORM para PostgreSQL
- **PostgreSQL** – Banco de dados relacional
- **dotenv** – Gerenciamento de variáveis de ambiente
- **Nodemon** – Hot reload em desenvolvimento

---

## ⚙️ Como Rodar o Projeto

### 1. Pré-requisitos

- **Node.js** instalado (>= 18.x recomendado)  
- **PostgreSQL** instalado localmente ou via cloud (ex: Render, Supabase)  

---

### 2. Clonar o Repositório

```bash
git clone https://github.com/limaamorim/Proleduca_Backend
cd Proleduca_Backend
```

---

### 3. Instalar Dependências

```bash
npm install
```

---

### 4. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:

```env
# Servidor
PORT=3000

# Banco de Dados (exemplo Render/Supabase)
DB_HOST=seu_host
DB_PORT=5432
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=seu_banco
```

---

### 5. Rodar o Servidor

Modo **desenvolvimento** (com Nodemon):
```bash
npm run dev
```

Modo **produção**:
```bash
npm start
```

---

## 🌐 Endpoints Disponíveis

- `GET /` → Rota de teste (retorna mensagem "Amigo Edu API v1.0 está no ar 🚀")  
- `POST /api/v1/auth/cadastro` → (em construção)  
- `POST /api/v1/auth/login` → (em construção)  

---

## 📡 Testar Conexão com Banco

Ao iniciar, o servidor faz a verificação automática da conexão com o PostgreSQL.  
Se estiver tudo certo, você verá no console:

```
✅ CONEXÃO COM POSTGRES ESTABELECIDA COM SUCESSO!
Servidor rodando em http://localhost:3000
```

---

## 📜 Scripts Úteis

- `npm run dev` → roda com Nodemon (hot reload)  
- `npm start` → roda em produção (Node puro)  

---

## 📝 Próximos Passos

- Implementar rotas de autenticação em `routes/auth.routes.js`  
- Criar modelos Sequelize (User, Indicação, Gamificação, etc.)  
- Adicionar testes automatizados  

---
