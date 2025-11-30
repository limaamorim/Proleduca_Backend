const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const { Resend } = require("resend");

// usa a variável certa do .env
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = {
  async enviarCodigo(req, res) {
    try {
      const { email } = req.body;

      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(404).json({ error: "E-mail não encontrado" });
      }

      const codigo = Math.floor(1000 + Math.random() * 9000).toString();

      await usuario.update({
        reset_code: codigo,
        reset_expires: Date.now() + 5 * 60 * 1000,
      });

      // Usa a variável correta RESEND_FROM
      const resultado = await resend.emails.send({
        from: process.env.RESEND_FROM,
        to: email,
        subject: "Seu código de recuperação de senha",
        html: `
          <div style="font-family: Arial; padding: 20px;">
            <h2 style="color:#3D70B4;">Recuperação de senha</h2>
            <p>Seu código é:</p>
            <h1 style="font-size: 40px; letter-spacing: 6px; margin: 0;">
              ${codigo}
            </h1>
            <p>Ele expira em 5 minutos.</p>
          </div>
        `,
      });

      console.log("🔥 RESEND RESULTADO:", resultado);

      if (resultado.error) {
        console.error("🔥 ERRO NO RESEND:", resultado.error);
        return res.status(500).json({
          error: "Erro ao enviar e-mail",
          detail: resultado.error,
        });
      }

      return res.json({ message: "Código enviado com sucesso!" });

    } catch (err) {
      console.error("🔥 ERRO AO ENVIAR CÓDIGO:", err);
      return res.status(500).json({
        error: "Erro ao enviar código",
        detail: err.message,
      });
    }
  },

  async verificarCodigo(req, res) {
    try {
      const { email, codigo } = req.body;

      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });
      if (usuario.reset_code !== codigo) return res.status(400).json({ error: "Código incorreto" });
      if (usuario.reset_expires < Date.now()) return res.status(400).json({ error: "Código expirado" });

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
      if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

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
