const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");

module.exports = {
  async enviarCodigo(req, res) {
    try {
      const { email } = req.body;

      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario) {
        return res.status(404).json({ error: "E-mail não encontrado" });
      }

      // Gera código
      const codigo = Math.floor(1000 + Math.random() * 9000).toString();

      // Salva no banco
      await usuario.update({
        reset_code: codigo,
        reset_expires: Date.now() + 5 * 60 * 1000 // 5 minutos
      });

      console.log("Código enviado:", codigo); 
      // depois você adiciona nodemailer aqui

      return res.json({ message: "Código enviado!" });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao enviar código" });
    }
  },

  async verificarCodigo(req, res) {
    try {
      const { email, codigo } = req.body;

      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      if (usuario.reset_code !== codigo) {
        return res.status(400).json({ error: "Código incorreto" });
      }

      if (usuario.reset_expires < Date.now()) {
        return res.status(400).json({ error: "Código expirado" });
      }

      return res.json({ message: "Código válido!" });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao validar código" });
    }
  },

  async novaSenha(req, res) {
    try {
      const { email, senha } = req.body;

      const usuario = await Usuario.findOne({
        where: { email }
      });

      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      await usuario.update({
        senha_hash: senhaHash,
        reset_code: null,
        reset_expires: null
      });

      return res.json({ message: "Senha atualizada com sucesso!" });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao redefinir senha" });
    }
  }
};
