const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_KEY);

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
        reset_expires: Date.now() + 5 * 60 * 1000,
      });

      // 🔥 Envia e-mail usando Resend (SEM SMTP)
      await resend.emails.send({
        from: "Proleduca <no-reply@proleduca.com>",
        to: email,
        subject: "Seu código de recuperação de senha",
        html: `
          <div style="font-family: Arial; text-align: center;">
            <h2>🔐 Recuperação de senha</h2>
            <p>Seu código de verificação é:</p>
            <h1 style="font-size: 32px; letter-spacing: 6px;">${codigo}</h1>
            <p>O código expira em 5 minutos.</p>
          </div>
        `,
      });

      return res.json({ message: "Código enviado!" });

    } catch (err) {
      console.error("🔥 ERRO AO ENVIAR CÓDIGO:", err);
      return res
        .status(500)
        .json({ error: "Erro ao enviar código", detail: err.message });
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
      console.error("🔥 ERRO AO VALIDAR CÓDIGO:", err);
      return res.status(500).json({ error: "Erro ao validar código" });
    }
  },

  async novaSenha(req, res) {
    try {
      const { email, senha } = req.body;

      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      await usuario.update({
        senha_hash: senhaHash,
        reset_code: null,
        reset_expires: null,
      });

      return res.json({ message: "Senha atualizada com sucesso!" });
    } catch (err) {
      console.error("🔥 ERRO AO ATUALIZAR SENHA:", err);
      return res.status(500).json({ error: "Erro ao redefinir senha" });
    }
  },
};
