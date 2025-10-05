const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

module.exports = {
    async criar(req, res) {
        try {
            const { nome, email, senha } = req.body;
            if (!nome || !email || !senha) {
                return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
            }

            const senhaHash = await bcrypt.hash(senha, 10);

            const admin = await Admin.create({ nome, email, senha_hash: senhaHash });
            return res.status(201).json(admin);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },

    async listar(req, res) {
        const admins = await Admin.findAll({
            attributes: ['id', 'nome', 'email', 'criado_em']
        });
        return res.json(admins);
    },

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, email } = req.body;

            const admin = await Admin.findByPk(id);
            if (!admin) return res.status(404).json({ error: 'Admin não encontrado' });

            await admin.update({ nome, email });
            return res.json({ message: 'Admin atualizado com sucesso!' });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },

    async deletar(req, res) {
        try {
            const { id } = req.params;
            const admin = await Admin.findByPk(id);
            if (!admin) return res.status(404).json({ error: 'Admin não encontrado' });

            await admin.destroy();
            return res.json({ message: 'Admin removido com sucesso!' });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
};
