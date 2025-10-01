🚀 Amigo Edu Backend (API)
Backend da plataforma de indicações Amigo Edu, desenvolvido para gerenciar usuários, o sistema de gamificação, links de indicação e a área administrativa. O projeto visa gerar renda extra para os usuários e incentivar o acesso à educação por meio de bolsas de estudo.

💻 Tecnologias Utilizadas
Tecnologia	Função Principal
Node.js	Ambiente de execução JavaScript.
Express	Framework web para roteamento e middlewares.
Sequelize	ORM (Mapeador Objeto-Relacional) para interagir com o PostgreSQL.
PostgreSQL	Banco de dados relacional robusto (Hospedado via Render).
dotenv	Gerenciamento de variáveis de ambiente.
JWT	JSON Web Tokens para autenticação segura.
bcryptjs	Biblioteca para hashing seguro de senhas.

Exportar para as Planilhas
⚙️ Configuração do Ambiente Local
Siga os passos abaixo para preparar e rodar a aplicação em sua máquina.

1. Pré-requisitos
Certifique-se de ter instalado:

Node.js (versão 18+)

Gerenciador de pacotes npm (incluso no Node.js)

Git

2. Instalação
Na pasta raiz do projeto, execute o comando para instalar todas as dependências:

Bash

npm install
3. Configuração de Variáveis de Ambiente (.env)
Crie um arquivo chamado .env na raiz do projeto para armazenar as credenciais e variáveis de ambiente.

⚠️ Segurança: Este arquivo NUNCA deve ser versionado.

Snippet de código

# Configurações do Servidor
PORT=3000
JWT_SECRET=USE_UMA_CHAVE_SECRETA_LONGA_E_ALEATORIA_AQUI

# Configurações do PostgreSQL (Credenciais do Render)
DB_HOST=SEU_HOST_AQUI
DB_PORT=5432
DB_USER=SEU_USUARIO_AQUI
DB_PASS=SUA_SENHA_AQUI
DB_NAME=SEU_NOME_DO_BANCO_AQUI
4. Conexão SSL (Importante)
A conexão está configurada no arquivo src/database/index.js para exigir SSL (require: true), conforme exigido pelo serviço de hospedagem do PostgreSQL.

▶️ Como Rodar a Aplicação
Use os scripts definidos no package.json:

Comando	Descrição
npm run dev	Inicia o servidor usando Nodemon (para desenvolvimento com live reload).
npm start	Inicia o servidor em modo de produção.

Exportar para as Planilhas
🚀 Amigo Edu Backend (API)
Backend da plataforma de indicações Amigo Edu, desenvolvido para gerenciar usuários, o sistema de gamificação, links de indicação e a área administrativa. O projeto visa gerar renda extra para os usuários e incentivar o acesso à educação por meio de bolsas de estudo.

💻 Tecnologias Utilizadas
Tecnologia	Função Principal
Node.js	Ambiente de execução JavaScript.
Express	Framework web para roteamento e middlewares.
Sequelize	ORM (Mapeador Objeto-Relacional) para interagir com o PostgreSQL.
PostgreSQL	Banco de dados relacional robusto (Hospedado via Render).
dotenv	Gerenciamento de variáveis de ambiente.
JWT	JSON Web Tokens para autenticação segura.
bcryptjs	Biblioteca para hashing seguro de senhas.

Exportar para as Planilhas
⚙️ Configuração do Ambiente Local
Siga os passos abaixo para preparar e rodar a aplicação em sua máquina.

1. Pré-requisitos
Certifique-se de ter instalado:

Node.js (versão 18+)

Gerenciador de pacotes npm (incluso no Node.js)

Git

2. Instalação
Na pasta raiz do projeto, execute o comando para instalar todas as dependências:

Bash

npm install
3. Configuração de Variáveis de Ambiente (.env)
Crie um arquivo chamado .env na raiz do projeto para armazenar as credenciais e variáveis de ambiente.

⚠️ Segurança: Este arquivo NUNCA deve ser versionado.

Snippet de código

# Configurações do Servidor
PORT=3000
JWT_SECRET=USE_UMA_CHAVE_SECRETA_LONGA_E_ALEATORIA_AQUI

# Configurações do PostgreSQL (Credenciais do Render)
DB_HOST=SEU_HOST_AQUI
DB_PORT=5432
DB_USER=SEU_USUARIO_AQUI
DB_PASS=SUA_SENHA_AQUI
DB_NAME=SEU_NOME_DO_BANCO_AQUI
4. Conexão SSL (Importante)
A conexão está configurada no arquivo src/database/index.js para exigir SSL (require: true), conforme exigido pelo serviço de hospedagem do PostgreSQL.

▶️ Como Rodar a Aplicação
Use os scripts definidos no package.json:

Comando	Descrição
npm run dev	Inicia o servidor usando Nodemon.
npm start	Inicia o servidor em modo de produção.

Exportar para as Planilhas
