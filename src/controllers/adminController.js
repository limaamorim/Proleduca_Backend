// src/controllers/adminController.js
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

module.exports = {

    // Criar novo administrador
    async criar(req, res) {
        try {
            const { nome, email, senha } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({
                    error: 'Preencha todos os campos obrigatórios.'
                });
            }

            const senhaHash = await bcrypt.hash(senha, 10);

            const admin = await Admin.create({
                nome,
                email,
                senha_hash: senhaHash
            });

            return res.status(201).json(admin);

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },

    // Listar administradores
    async listar(req, res) {
        try {
            const admins = await Admin.findAll({
                attributes: ['id', 'nome', 'email', 'criado_em']
            });

            return res.json(admins);

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },

    // Atualizar administrador
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, email } = req.body;

            const admin = await Admin.findByPk(id);
            if (!admin) {
                return res.status(404).json({ error: 'Administrador não encontrado.' });
            }

            await admin.update({ nome, email });

            return res.json({
                message: 'Administrador atualizado com sucesso!'
            });

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },

    // Deletar administrador
    async deletar(req, res) {
        try {
            const { id } = req.params;

            const admin = await Admin.findByPk(id);
            if (!admin) {
                return res.status(404).json({ error: 'Administrador não encontrado.' });
            }

            await admin.destroy();

            return res.json({
                message: 'Administrador removido com sucesso!'
            });

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

};
