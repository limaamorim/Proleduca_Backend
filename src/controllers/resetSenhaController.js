const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");


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
        reset_expires: Date.now() + 5 * 60 * 1000
      });

      // 🔥 CONFIGURA NODMAILER AQUI:
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `Proleduca <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Seu código de recuperação de senha",
        text: `Seu código é: ${codigo}`,
        html: `<h1>Seu código é: ${codigo}</h1>`,
      });

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
