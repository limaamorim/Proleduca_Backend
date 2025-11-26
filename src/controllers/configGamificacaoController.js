// src/controllers/configController.js
const Config = require('../models/ConfigGamificacao');

module.exports = {

  // Lista todas as configurações
  async listar(req, res) {
    try {
      const configuracoes = await Config.findAll({
        order: [['chave']]
      });

      return res.json(configuracoes);

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  /**
   * Atualiza ou cria uma configuração
   * PUT /api/v1/config/:chave
   * body { valor: "..." }
   */
  async configurar(req, res) {
    try {
      const chave = req.params.chave;
      const { valor } = req.body;

      if (valor === undefined || valor === null) {
        return res.status(400).json({
          error: 'O campo "valor" é obrigatório no corpo da requisição.'
        });
      }

      // Busca existente
      const existente = await Config.findOne({ where: { chave } });

      if (existente) {
        existente.valor = String(valor);
        existente.atualizado_em = new Date();
        await existente.save();

        return res.json({
          message: 'Configuração atualizada com sucesso.',
          config: existente
        });

      } else {
        const novaConfig = await Config.create({
          chave,
          valor: String(valor)
        });

        return res.status(201).json({
          message: 'Configuração criada com sucesso.',
          config: novaConfig
        });
      }

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

};
