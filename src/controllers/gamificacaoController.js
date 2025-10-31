// src/controllers/gamificacaoController.js
const gamService = require('../services/gamificacaoService');

module.exports = {
  async obterPorUsuario(req, res) {
    try {
      const usuario_id = req.params.usuario_id;
      const g = await gamService.getByUsuario(usuario_id);
      const prox = gamService.pontosParaProximoNivel(g.nivel);
      return res.json({
        usuario_id: g.usuario_id,
        nivel: g.nivel,
        pontos: g.pontos,
        metas_batidas: g.metas_batidas,
        pontos_para_proximo_nivel: prox
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async adicionarPontos(req, res) {
    try {
      const usuario_id = req.params.usuario_id;
      const { pontos = 0, origem = null, referencia_id = null } = req.body;

      // opcional: validar token/autorização aqui

      const result = await gamService.adicionarPontos(usuario_id, pontos, async (meta, t) => {
        // exemplo: se quiser integrar com impactos (quando indicação validada),
        // criar um log em tabela, notificar etc. Aqui é só um stub.
      });

      return res.json({ message: 'Pontos adicionados', gamificacao: result.gamificacao, leveled: result.leveled });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};