// src/controllers/usuarioController.js
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const Gamificacao = require('../models/Gamificacao');
const Impacto = require('../models/Impacto');
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
    try {
      const usuarios = await Usuario.findAll({
        attributes: [
          'id', 'nome', 'email', 'telefone', 'cpf', 'data_nascimento',
          'link_indicacao', 'suspended', 'criado_em', 'atualizado_em'
        ],
        order: [['criado_em','DESC']]
      });

      // pegar todos os ids e buscar gamificações em batch
      const usuarioIds = usuarios.map(u => u.id);
      const gamRows = usuarioIds.length
        ? await Gamificacao.findAll({
            where: { usuario_id: usuarioIds },
            attributes: ['usuario_id','nivel','pontos','metas_batidas']
          })
        : [];

      const gamMap = new Map();
      gamRows.forEach(g => gamMap.set(g.usuario_id, g.toJSON()));

      const resposta = usuarios.map(u => {
        const json = u.toJSON();
        json.idade = json.data_nascimento ? calcularIdade(json.data_nascimento) : null;
        json.gamificacao = gamMap.get(json.id) || null;
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
      if (!id) return res.status(400).json({ error: 'id inválido' });

      const usuario = await Usuario.findByPk(id, {
        attributes: ['id','nome','email','telefone','cpf','data_nascimento','link_indicacao','criado_em','atualizado_em','suspended']
      });
      if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

      // buscar gamificacao e impacto
      const [gam, impacto] = await Promise.all([
        Gamificacao.findOne({ where: { usuario_id: id }, attributes: ['nivel','pontos','metas_batidas'] }),
        Impacto.findOne({ where: { usuario_id: id }, attributes: ['indicacoes_count','renda_gerada','bolsas_concedidas'] })
      ]);

      const json = usuario.toJSON();
      json.idade = json.data_nascimento ? calcularIdade(json.data_nascimento) : null;
      json.gamificacao = gam ? gam.toJSON() : null;
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

  // NOTA: removemos delete/login do controller conforme sua alteração anterior
};