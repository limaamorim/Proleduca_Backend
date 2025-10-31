// src/controllers/impactoController.js
const Impacto = require('../models/Impacto');
const impactService = require('../services/impactServices');

module.exports = {
  async obterPorUsuario(req, res) {
    try {
      const usuario_id = Number(req.params.usuario_id);
      if (!usuario_id) return res.status(400).json({ error: 'usuario_id inválido' });

      // tenta buscar impacto existente
      let impacto = await Impacto.findOne({ where: { usuario_id } });

      // se não existir, recalcula (gera/atualiza impacto) e busca novamente
      if (!impacto) {
        await impactService.recomputeImpactForUser(usuario_id);
        impacto = await Impacto.findOne({ where: { usuario_id } });
      }

      if (!impacto) return res.status(404).json({ error: 'Impacto não encontrado' });

      const { pode_sacar, renda, minimo } = await impactService.canUserWithdraw(usuario_id);
      return res.json({ impacto, pode_sacar, renda, minimo });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}