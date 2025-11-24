// src/controllers/indicacaoController.js
const Indicacao = require('../models/Indicacao');
const impactoService = require('../services/impactoService');
const gamificacaoService = require('../services/gamificacaoService');
const Config = require('../models/ConfigGamificacao');
const metaService = require('../services/metaService');
const { connection } = require('../database/index');

module.exports = {

  // Cria uma nova indicação
  async criar(req, res) {
    try {
      const { usuario_id, indicado_nome, indicado_email } = req.body;

      if (!usuario_id) {
        return res.status(400).json({ error: 'usuario_id é obrigatório' });
      }

      const indicacao = await Indicacao.create({
        usuario_id,
        indicado_nome,
        indicado_email
      });

      return res.status(201).json(indicacao);

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Lista indicações (todas ou filtradas por usuário)
  async listar(req, res) {
    try {
      const { usuario_id } = req.query;

      const filtro = usuario_id ? { usuario_id } : undefined;

      const lista = await Indicacao.findAll({
        where: filtro,
        order: [['data_indicacao', 'DESC']]
      });

      return res.json(lista);

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Obtém uma indicação específica
  async obter(req, res) {
    try {
      const indicacao = await Indicacao.findByPk(req.params.id);

      if (!indicacao) {
        return res.status(404).json({ error: 'Indicação não encontrada' });
      }

      return res.json(indicacao);

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  /**
   * Valida uma indicação:
   * - marca como validada
   * - recalcula impacto do usuário
   * - avalia metas atingidas
   * - adiciona pontos de gamificação
   * Tudo dentro de uma transaction para garantir consistência.
   */
  async validar(req, res) {
    const id = req.params.id;
    const adminId = req.user?.id ? Number(req.user.id) : null;

    return await connection.transaction(async (t) => {
      try {
        const indicacao = await Indicacao.findByPk(id, { transaction: t });

        if (!indicacao) {
          return res.status(404).json({ error: 'Indicação não encontrada' });
        }

        if (indicacao.validada) {
          return res.status(400).json({ error: 'Indicação já validada' });
        }

        // Marca como validada e registra quem validou
        indicacao.validada = true;
        indicacao.validada_em = new Date();
        indicacao.validada_por_admin_id = adminId;
        indicacao.atualizado_em = new Date();

        await indicacao.save({ transaction: t });

        // Atualiza impacto
        const impacto = await impactoService.recomputeImpactForUser(
          indicacao.usuario_id,
          t
        );

        // Avalia metas do usuário
        await metaService.evaluateMetasForUser(
          indicacao.usuario_id,
          t
        );

        // Busca configuração opcional de pontos
        const cfg = await Config.findOne({
          where: { chave: 'pontos_por_indicacao' },
          transaction: t
        });

        const pontosPorIndicacao = cfg ? Number(cfg.valor) : 0;

        let gamificacaoResultado = null;

        if (pontosPorIndicacao > 0) {
          gamificacaoResultado = await gamificacaoService.adicionarPontos(
            indicacao.usuario_id,
            pontosPorIndicacao,
            null,
            t
          );
        }

        return res.json({
          message: 'Indicação validada com sucesso',
          indicacao,
          impacto,
          gamificacao: gamificacaoResultado
        });

      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });
  }

};
