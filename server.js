const app = require('./src/app'); 
const dotenv = require('dotenv');

dotenv.config(); // Carrega as variáveis de ambiente

const PORT = process.env.PORT || 3333;


app.listen(PORT, () => {
    console.log(`Conexão com o PostgreSQL OK.`);
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});