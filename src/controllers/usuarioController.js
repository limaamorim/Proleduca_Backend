const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const SECRET = 'chave_secreta_super_segura'; 

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
            attributes: ['id', 'nome', 'email', 'telefone', 'cpf', 'idade', 'senha_hash','link_indicacao', 'criado_em', 'atualizado_em']
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
    },

    async login(req, res) {
        try {
            const { email, senha } = req.body;

            const usuario = await Usuario.findOne({ where: { email } });
            if (!usuario) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
            if (!senhaCorreta) {
                return res.status(401).json({ message: 'Senha incorreta' });
            }

            const token = jwt.sign(
                { id: usuario.id, email: usuario.email },
                SECRET,
                { expiresIn: '1d' }
            );

            return res.json({
                message: 'Login bem-sucedido!',
                token,
                user: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    cpf: usuario.cpf,
                    telefone: usuario.telefone,
                    idade: usuario.idade,
                    link_indicacao: usuario.link_indicacao
                }
            });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
};
