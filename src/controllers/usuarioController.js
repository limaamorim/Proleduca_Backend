const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { calcularIdade } = require('../utils/calculoDeIdade');

module.exports = {
    async criar(req, res) {
        try {
            const { nome, telefone, email, cpf, data_nascimento, senha } = req.body;

            if (!nome || !telefone || !email || !cpf || !senha || !data_nascimento) {
                return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
            }

            const senhaHash = await bcrypt.hash(senha, 10);
            const link_indicacao = `https://amigoedu.com/indicacao/${cpf}`;

            const usuario = await Usuario.create({
                nome,
                telefone,
                email,
                cpf,
                data_nascimento,
                senha_hash: senhaHash,
                link_indicacao
            });

            // Adiciona idade calculada no retorno 
            const idade = calcularIdade(data_nascimento);

            return res.status(201).json({ ...usuario.toJSON(), idade });

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },

    async listar(req, res) {
        const usuarios = await Usuario.findAll({
            attributes: [
                'id', 'nome', 'email', 'telefone', 'cpf', 'data_nascimento',
                'link_indicacao', 'suspended', 'criado_em', 'atualizado_em'
            ]
        });

        const resposta = usuarios.map(u => {
            const json = u.toJSON();
            json.idade = calcularIdade(json.data_nascimento);
            return json;
        });

        return res.json(resposta);
    },

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, telefone, email, data_nascimento } = req.body;

            const usuario = await Usuario.findByPk(id);
            if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

            await usuario.update({ nome, telefone, email, data_nascimento });

            return res.json({
                message: 'Usuário atualizado com sucesso!',
                idade: calcularIdade(data_nascimento || usuario.data_nascimento)
            });

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },
};
