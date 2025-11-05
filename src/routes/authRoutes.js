const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario'); // ou Admin, conforme seu caso

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await Usuario.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Usuário não encontrado" });

    const senhaCorreta = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaCorreta) return res.status(400).json({ message: "Senha incorreta" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Login realizado com sucesso!",
      user,
      token,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
});

module.exports = router;
