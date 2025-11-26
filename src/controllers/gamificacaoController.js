// src/controllers/gamificacaoController.js
const gamificacaoService = require('../services/gamificacaoService');

module.exports = {

  // Retorna dados de gamificação do usuário
  async obterPorUsuario(req, res) {
    try {
      const usuario_id = req.params.usuario_id;

      const gamificacao = await gamificacaoService.buscarPorUsuario(usuario_id);
      const pontosProximoNivel = gamificacaoService.pontosParaProximoNivel(gamificacao.nivel);

      return res.json({
        usuario_id: gamificacao.usuario_id,
        nivel: gamificacao.nivel,
        pontos: gamificacao.pontos,
        metas_batidas: gamificacao.metas_batidas,
        pontos_para_proximo_nivel: pontosProximoNivel
      });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Adiciona pontos ao usuário
  async adicionarPontos(req, res) {
    try {
      const usuario_id = req.params.usuario_id;
      const { pontos = 0, origem = null, referencia_id = null } = req.body;

      // Aqui poderia validar permissão/token caso necessário

      const resultado = await gamificacaoService.adicionarPontos(
        usuario_id,
        pontos
      );

      return res.json({
        message: 'Pontos adicionados com sucesso',
        gamificacao: resultado.gamificacao,
        leveled: resultado.leveled
      });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
