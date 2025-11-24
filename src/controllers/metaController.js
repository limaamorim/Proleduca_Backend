// src/controllers/metaController.js
const Meta = require('../models/Meta');
const UsuarioMeta = require('../models/UsuarioMeta');
const metaService = require('../services/metaService');

module.exports = {

  // GET /api/v1/metas – lista todas as metas
  async listar(req, res) {
    try {
      const metas = await Meta.findAll({ order: [['criado_em', 'DESC']] });
      return res.json(metas);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // GET /api/v1/metas/:id – obtém uma meta específica
  async obter(req, res) {
    try {
      const id = Number(req.params.id);
      const meta = await Meta.findByPk(id);

      if (!meta) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }

      return res.json(meta);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // ADMIN: POST /api/v1/metas – cria uma nova meta
  async criar(req, res) {
    try {
      const dados = req.body;

      if (!dados.nome || !dados.alvo_indicacoes) {
        return res.status(400).json({
          error: 'nome e alvo_indicacoes são obrigatórios'
        });
      }

      const novaMeta = await Meta.create({
        nome: dados.nome,
        descricao: dados.descricao || null,
        tipo_periodicidade: dados.tipo_periodicidade || 'unica',
        alvo_indicacoes: Number(dados.alvo_indicacoes) || 1,
        recompensa: dados.recompensa || 0.00,
        ativo: typeof dados.ativo === 'boolean' ? dados.ativo : true,
        inicio_validade: dados.inicio_validade || null,
        fim_validade: dados.fim_validade || null
      });

      return res.status(201).json(novaMeta);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // ADMIN: PUT /api/v1/metas/:id – atualiza uma meta
  async atualizar(req, res) {
    try {
      const id = Number(req.params.id);

      const meta = await Meta.findByPk(id);
      if (!meta) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }

      await meta.update({
        ...req.body,
        atualizado_em: new Date()
      });

      return res.json({
        message: 'Meta atualizada com sucesso',
        meta
      });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // ADMIN: DELETE /api/v1/metas/:id – remove uma meta
  async deletar(req, res) {
    try {
      const id = Number(req.params.id);

      const meta = await Meta.findByPk(id);
      if (!meta) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }

      await meta.destroy();
      return res.json({ message: 'Meta removida com sucesso' });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // GET /api/v1/metas/usuario/:usuario_id – progresso do usuário nas metas
  async progressoPorUsuario(req, res) {
    try {
      const usuario_id = Number(req.params.usuario_id);

      const progresso = await UsuarioMeta.findAll({
        where: { usuario_id }
      });

      return res.json(progresso);

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

};
