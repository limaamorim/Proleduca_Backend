// src/controllers/configController.js
const Config = require('../models/ConfigGamificacao');

module.exports = {
  async listar(req, res) {
    try {
      const rows = await Config.findAll({ order: [['chave']] });
      return res.json(rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // upsert por chave: PUT /api/v1/config/:chave  body { valor: "..." }
  async upsert(req, res) {
    try {
      const chave = req.params.chave;
      const { valor } = req.body;
      if (typeof valor === 'undefined' || valor === null) {
        return res.status(400).json({ error: 'valor é obrigatório no body' });
      }

      // find or create/update
      const existing = await Config.findOne({ where: { chave } });
      if (existing) {
        existing.valor = String(valor);
        existing.atualizado_em = new Date();
        await existing.save();
        return res.json({ message: 'Config atualizada', config: existing });
      } else {
        const created = await Config.create({ chave, valor: String(valor) });
        return res.status(201).json({ message: 'Config criada', config: created });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
