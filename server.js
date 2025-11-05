// server.js
const app = require('./src/app');
const dotenv = require('dotenv');

dotenv.config();

// Importa testConnection de src/database (garanta que o arquivo exporte)
const { testConnection } = require('./src/database');

const PORT = process.env.PORT || 3333;

(async () => {
  // Mostrar parte da DATABASE_URL para confirmar leitura (sem expor senha inteira)
  const db = process.env.DATABASE_URL || `${process.env.DB_USER || ''}@${process.env.DB_HOST || ''}`;
  const masked = db ? (db.length > 60 ? db.slice(0, 40) + '...' : db) : '(nenhuma)';
  console.log('DB (parcial):', masked);

  try {
    // testa a conexão com o banco (testConnection deve existir em src/database)
    if (typeof testConnection === 'function') {
      await testConnection();
    } else {
      console.warn('testConnection não encontrada — pulando teste de DB');
    }

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar servidor:', err.message || err);
    process.exit(1);
  }
})();
