const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const TOKEN_EXPIRES = process.env.JWT_EXPIRES || "1d";

module.exports = {
    async login(req, res) {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({ message: "email e senha são obrigatórios" });
            }

            // Primeiro Tenta autenticar ADMIN
            const admin = await Admin.findOne({ where: { email } });

            if (admin) {
                const ok = await bcrypt.compare(senha, admin.senha_hash);
                if (!ok) return res.status(401).json({ message: "Credenciais inválidas" });

                const token = jwt.sign(
                    { id: admin.id, email: admin.email, role: "admin" },
                    JWT_SECRET,
                    { expiresIn: TOKEN_EXPIRES }
                );

                return res.json({
                    message: "Login admin ok",
                    token,
                    user: {
                        id: admin.id,
                        nome: admin.nome,
                        email: admin.email,
                        role: "admin"
                    }
                });
            }

            // Segundo Tenta autenticar USUÁRIO
            const user = await Usuario.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }

            // Verifica senha
            const ok = await bcrypt.compare(senha, user.senha_hash);
            if (!ok) return res.status(401).json({ message: "Credenciais inválidas" });

            // Verifica suspensão
            if (user.suspended) {
                return res.status(403).json({
                    message: "Sua conta está suspensa. Entre em contato com o suporte."
                });
            }

            // Gera token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: "user" },
                JWT_SECRET,
                { expiresIn: TOKEN_EXPIRES }
            );

            return res.json({
                message: "Login realizado com sucesso!",
                token,
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                    role: "user",
                    link_indicacao: user.link_indicacao
                }
            });

        } catch (error) {
            console.error("Erro no login:", error);
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
    }
};
