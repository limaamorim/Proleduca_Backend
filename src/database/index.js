const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
  logging: false,
};

const connection = new Sequelize(config);

async function testConnection() {
  try {
    await connection.authenticate();
    console.log('✅ CONEXÃO COM POSTGRES ESTABELECIDA COM SUCESSO!');
  } catch (error) {
    console.error('❌ ERRO AO CONECTAR COM O BANCO DE DADOS:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();

module.exports = connection; // <---- exporte só isso
