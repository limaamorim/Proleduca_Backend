const express = require('express');
const cors = require('cors'); 
require('./database'); 

const authRoutes = require('./routes/authRoutes'); 
const usuarioRoutes = require('./routes/usuarioRoutes'); 
const adminRoutes = require('./routes/adminRoutes'); 

const app = express();
dotenv.config()

app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {
    res.status(200).send({ message: 'Amigo Edu API v1.0 está no ar! 🚀' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/usuarios', usuarioRoutes);
app.use('/api/v1/admins', adminRoutes);

module.exports = app;
