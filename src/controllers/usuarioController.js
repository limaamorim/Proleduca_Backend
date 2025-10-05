const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');

module.exports = {
    async criar(req, res) {
        try {
            const { nome, telefone, email, cpf, idade, senha } = req.body;
            
            if (!nome || !telefone || !email || !cpf || !senha) {
                return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
            }

            const senhaHash = await bcrypt.hash(senha, 10);
            const link_indicacao = `https://amigoedu.com/indicacao/${cpf}`;

            const usuario = await Usuario.create({
                nome, telefone, email, cpf, idade, senha_hash: senhaHash, link_indicacao
            });

            return res.status(201).json(usuario);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },

    async listar(req, res) {
        const usuarios = await Usuario.findAll({
            attributes: ['id', 'nome', 'email', 'telefone', 'cpf', 'idade', 'link_indicacao']
        });
        return res.json(usuarios);
    },

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, telefone, email, idade } = req.body;

            const usuario = await Usuario.findByPk(id);
            if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

            await usuario.update({ nome, telefone, email, idade });
            return res.json({ message: 'Usuário atualizado com sucesso!' });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },

    async deletar(req, res) {
        try {
            const { id } = req.params;
            const usuario = await Usuario.findByPk(id);
            if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

            await usuario.destroy();
            return res.json({ message: 'Usuário removido com sucesso!' });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
};
