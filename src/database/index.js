// src/database/index.js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const isProd = process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true';

// Preferir DATABASE_URL (Render fornece essa URL). Se não existir, usa variáveis isoladas.
const connectionString = process.env.DATABASE_URL || null;

let sequelize;

if (connectionString) {
  sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: isProd
      ? {
          ssl: {
            require: true,
            // necessário quando o certificado do provedor não é verificado por CA local
            rejectUnauthorized: false
          }
        }
      : {}
  });
} else {
  // fallback para variáveis separadas (útil localmente)
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'amigo_edu_db',
    username: process.env.DB_USER || 'amigo_edu_db_user',
    password: process.env.DB_PASS || '',
    dialect: 'postgres',
    logging: false,
    dialectOptions: {}
  };

  // se não for localhost e estiver em produção, habilita ssl
  if (isProd && config.host && config.host !== '127.0.0.1' && config.host !== 'localhost') {
    config.dialectOptions.ssl = { require: true, rejectUnauthorized: false };
  }

  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ CONEXÃO COM POSTGRES ESTABELECIDA COM SUCESSO!');
  } catch (error) {
    console.error('❌ ERRO AO CONECTAR COM O BANCO DE DADOS:');
    console.error(error.message);
    // não finalizar o processo aqui — permitindo debug local
    // process.exit(1);
  }
}

module.exports = { connection: sequelize, testConnection };
