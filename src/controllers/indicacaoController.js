// src/controllers/indicacaoController.js
const Indicacao = require('../models/Indicacao');
const impactService = require('../services/impactServices');
const gamService = require('../services/gamificacaoService');
const Config = require('../models/ConfigGamificacao');
const { connection } = require('../database/index');

module.exports = {
  async criar(req, res) {
    try {
      const { usuario_id, indicado_nome, indicado_email } = req.body;
      if (!usuario_id) return res.status(400).json({ error: 'usuario_id é obrigatório' });
      const indicacao = await Indicacao.create({ usuario_id, indicado_nome, indicado_email });
      return res.status(201).json(indicacao);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async listar(req, res) {
    try {
      const { usuario_id } = req.query;
      const where = usuario_id ? { usuario_id } : undefined;
      const list = await Indicacao.findAll({ where, order: [['data_indicacao', 'DESC']] });
      return res.json(list);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async obter(req, res) {
    try {
      const indicacao = await Indicacao.findByPk(req.params.id);
      if (!indicacao) return res.status(404).json({ error: 'Indicação não encontrada' });
      return res.json(indicacao);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  /**
   * Validar indicação: marca validada, recalcula impacto e adiciona pontos.
   * Tudo em uma transaction compartilhada para garantir consistência.
   */
async validar(req, res) {
  const id = req.params.id;
  const adminId = req.user && req.user.id ? Number(req.user.id) : null;

  return await connection.transaction(async (t) => {
    try {
      const indicacao = await Indicacao.findByPk(id, { transaction: t });
      if (!indicacao) return res.status(404).json({ error: 'Indicação não encontrada' });
      if (indicacao.validada) return res.status(400).json({ error: 'Indicação já validada' });

      // marcar como validada e registrar quem validou (admin)
      indicacao.validada = true;
      indicacao.validada_em = new Date();
      indicacao.validada_por_admin_id = adminId; // auditoria
      indicacao.atualizado_em = new Date();
      await indicacao.save({ transaction: t });

      // recalcula impacto usando a mesma transaction
      const impacto = await impactService.recomputeImpactForUser(indicacao.usuario_id, t);

      // buscar pontos por indicação na config (se existir)
      const cfg = await Config.findOne({ where: { chave: 'pontos_por_indicacao' }, transaction: t });
      const pontosPorIndicacao = cfg ? Number(cfg.valor) : 0;

      let gamificacaoResult = null;
      if (pontosPorIndicacao > 0) {
        gamificacaoResult = await gamService.adicionarPontos(indicacao.usuario_id, pontosPorIndicacao, null, t);
      }

      return res.json({
        message: 'Indicação validada',
        indicacao,
        impacto,
        gamificacao: gamificacaoResult
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
}
};