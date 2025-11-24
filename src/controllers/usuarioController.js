// src/controllers/usuarioController.js
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const Gamificacao = require('../models/Gamificacao');
const Impacto = require('../models/Impacto');
const { calcularIdade } = require('../utils/calculoDeIdade');
const { formatarCPF, formatarTelefone } = require('../utils/formatters');

module.exports = {

  async criar(req, res) {
    try {
      const { nome, telefone, email, cpf, data_nascimento, senha } = req.body;

      if (!nome || !telefone || !email || !cpf || !senha || !data_nascimento) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
      }

      const senhaCriptografada = await bcrypt.hash(senha, 10);
      const cpfFormatado = formatarCPF(cpf);
      const telefoneFormatado = formatarTelefone(telefone);
      const linkIndicacao = `https://amigoedu.com/indicacao/${cpfFormatado}`;

      const novoUsuario = await Usuario.create({
        nome,
        telefone: telefoneFormatado,
        email,
        cpf: cpfFormatado,
        data_nascimento,
        senha_hash: senhaCriptografada,
        link_indicacao: linkIndicacao
      });

      const idade = calcularIdade(data_nascimento);

      return res.status(201).json({ ...novoUsuario.toJSON(), idade });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async listar(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: [
          'id', 'nome', 'email', 'telefone', 'cpf', 'data_nascimento',
          'link_indicacao', 'suspended', 'criado_em', 'atualizado_em'
        ],
        order: [['criado_em', 'DESC']]
      });

      const idsUsuarios = usuarios.map(u => u.id);

      const gamificacoes = idsUsuarios.length
        ? await Gamificacao.findAll({
            where: { usuario_id: idsUsuarios },
            attributes: ['usuario_id', 'nivel', 'pontos', 'metas_batidas']
          })
        : [];

      const mapaGamificacao = new Map();
      gamificacoes.forEach(g => mapaGamificacao.set(g.usuario_id, g.toJSON()));

      const resposta = usuarios.map(u => {
        const json = u.toJSON();
        json.idade = json.data_nascimento ? calcularIdade(json.data_nascimento) : null;
        json.gamificacao = mapaGamificacao.get(json.id) || null;
        return json;
      });

      return res.json(resposta);

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async obter(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'ID inválido.' });

      const usuario = await Usuario.findByPk(id, {
        attributes: [
          'id','nome','email','telefone','cpf','data_nascimento',
          'link_indicacao','criado_em','atualizado_em','suspended'
        ]
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const [gamificacao, impacto] = await Promise.all([
        Gamificacao.findOne({
          where: { usuario_id: id },
          attributes: ['nivel','pontos','metas_batidas']
        }),
        Impacto.findOne({
          where: { usuario_id: id },
          attributes: ['indicacoes_count','renda_gerada','bolsas_concedidas']
        })
      ]);

      const json = usuario.toJSON();
      json.idade = json.data_nascimento ? calcularIdade(json.data_nascimento) : null;
      json.gamificacao = gamificacao ? gamificacao.toJSON() : null;
      json.impacto = impacto ? impacto.toJSON() : null;

      return res.json(json);

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, telefone, email, data_nascimento } = req.body;

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const dadosAtualizados = { nome, email, data_nascimento };

      if (telefone) {
        dadosAtualizados.telefone = formatarTelefone(telefone);
      }

      await usuario.update(dadosAtualizados);

      return res.json({
        message: 'Usuário atualizado com sucesso!',
        idade: calcularIdade(data_nascimento || usuario.data_nascimento)
      });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
