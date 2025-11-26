// src/controllers/authController.js
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
                return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
            }

            // Tentativa de login como ADMIN
            const admin = await Admin.findOne({ where: { email } });

            if (admin) {
                const senhaValida = await bcrypt.compare(senha, admin.senha_hash);
                if (!senhaValida) {
                    return res.status(401).json({ message: "Credenciais inválidas." });
                }

                const token = jwt.sign(
                    {
                        id: admin.id,
                        email: admin.email,
                        role: "admin"
                    },
                    JWT_SECRET,
                    { expiresIn: TOKEN_EXPIRES }
                );

                return res.json({
                    message: "Login de administrador realizado com sucesso!",
                    token,
                    user: {
                        id: admin.id,
                        nome: admin.nome,
                        email: admin.email,
                        role: "admin"
                    }
                });
            }

            // Tentativa de login como USUÁRIO comum
            const usuario = await Usuario.findOne({ where: { email } });

            if (!usuario) {
                return res.status(404).json({ message: "Usuário não encontrado." });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
            if (!senhaValida) {
                return res.status(401).json({ message: "Credenciais inválidas." });
            }

            // Verifica se a conta está suspensa
            if (usuario.suspended) {
                return res.status(403).json({
                    message: "Sua conta está suspensa. Entre em contato com o suporte."
                });
            }

            // Gera o token do usuário
            const token = jwt.sign(
                {
                    id: usuario.id,
                    email: usuario.email,
                    role: "user"
                },
                JWT_SECRET,
                { expiresIn: TOKEN_EXPIRES }
            );

            return res.json({
                message: "Login realizado com sucesso!",
                token,
                user: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    role: "user",
                    link_indicacao: usuario.link_indicacao
                }
            });

        } catch (error) {
            console.error("Erro no login:", error);
            return res.status(500).json({ message: "Erro interno no servidor." });
        }
    }

};
