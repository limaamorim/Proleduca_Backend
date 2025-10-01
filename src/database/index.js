
const Sequelize = require('sequelize');
const dotenv = require('dotenv');

// Carregando as variáveis do .env
dotenv.config();

// Configurações do Banco de Dados
const config = {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    //Configuração do SSL conforme o (Requirement)
    dialectOptions: {
        ssl: {
            require: true, 
            rejectUnauthorized: false // Permite conectar sem certificado CA local
        }
    },
    logging: false, //desativando logs SQL
};

// Cria a instância do Sequelize
const connection = new Sequelize(config);

// Função para testar a conexão
async function testConnection() {
    try {
        // Tenta autenticar/conectar
        await connection.authenticate();
        console.log('✅ CONEXÃO COM POSTGRES ESTABELECIDA COM SUCESSO!');
    } catch (error) {
        console.error('❌ ERRO AO CONECTAR COM O BANCO DE DADOS:');
        console.error(error.message);
        
        // Se a conexão falhar, garantimos que o processo pare para depuração
        process.exit(1); 
    }
}

// Exportando a função de teste 
module.exports = { testConnection };