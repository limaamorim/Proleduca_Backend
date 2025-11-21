// src/controllers/metaController.js
const Meta = require('../models/Meta');
const UsuarioMeta = require('../models/UsuarioMeta');
const metaService = require('../services/metaService');

module.exports = {
  // GET /api/v1/metas -> lista metas ativas (todos)
  async listar(req, res) {
    try {
      const metas = await Meta.findAll({ order: [['criado_em','DESC']] });
      return res.json(metas);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // GET /api/v1/metas/:id
  async obter(req, res) {
    try {
      const id = Number(req.params.id);
      const m = await Meta.findByPk(id);
      if (!m) return res.status(404).json({ error: 'Meta não encontrada' });
      return res.json(m);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // ADMIN: POST /api/v1/metas
  async criar(req, res) {
    try {
      const payload = req.body;
      // validações simples aqui (campo nome, alvo_indicacoes)
      if (!payload.nome || !payload.alvo_indicacoes) return res.status(400).json({ error: 'nome e alvo_indicacoes obrigatórios' });

      const m = await Meta.create({
        nome: payload.nome,
        descricao: payload.descricao || null,
        tipo_periodicidade: payload.tipo_periodicidade || 'unica',
        alvo_indicacoes: Number(payload.alvo_indicacoes) || 1,
        recompensa: payload.recompensa || 0.00,
        ativo: typeof payload.ativo === 'boolean' ? payload.ativo : true,
        inicio_validade: payload.inicio_validade || null,
        fim_validade: payload.fim_validade || null
      });
      return res.status(201).json(m);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // ADMIN: PUT /api/v1/metas/:id
  async atualizar(req, res) {
    try {
      const id = Number(req.params.id);
      const m = await Meta.findByPk(id);
      if (!m) return res.status(404).json({ error: 'Meta não encontrada' });
      await m.update({ ...req.body, atualizado_em: new Date() });
      return res.json({ message: 'Meta atualizada', meta: m });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // ADMIN: DELETE /api/v1/metas/:id
  async deletar(req, res) {
    try {
      const id = Number(req.params.id);
      const m = await Meta.findByPk(id);
      if (!m) return res.status(404).json({ error: 'Meta não encontrada' });
      await m.destroy();
      return res.json({ message: 'Meta removida' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // GET /api/v1/metas/usuario/:usuario_id -> progresso do usuário em todas metas
  async progressoPorUsuario(req, res) {
    try {
      const usuario_id = Number(req.params.usuario_id);
      const registros = await UsuarioMeta.findAll({ where: { usuario_id } });
      return res.json(registros);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

};
