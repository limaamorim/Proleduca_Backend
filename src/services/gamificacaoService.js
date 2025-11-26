// src/services/gamificacaoService.js
const Gamificacao = require('../models/Gamificacao');
const { connection } = require('../database');

/**
 * Regra simples para calcular os pontos necessários para avançar de nível.
 */
function pontosNecessariosParaProximoNivel(nivelAtual) {
  return nivelAtual * 100;
}

/**
 * Adiciona pontos ao usuário.
 */
async function adicionarPontos(
  usuarioId,
  pontosParaAdicionar,
  metaCallback = null,
  transacaoExterna = null
) {
  if (!usuarioId) throw new Error('O campo usuarioId é obrigatório.');

  let transacao;
  let criouTransacao = false;

  try {
    if (transacaoExterna) {
      transacao = transacaoExterna;
    } else {
      transacao = await connection.transaction();
      criouTransacao = true;
    }

    let gamificacao = await Gamificacao.findOne({
      where: { usuario_id: usuarioId },
      transaction: transacao
    });

    if (!gamificacao) {
      gamificacao = await Gamificacao.create(
        { usuario_id: usuarioId, pontos: 0 },
        { transaction: transacao }
      );
    }

    gamificacao.pontos = Number(gamificacao.pontos) + Number(pontosParaAdicionar);

    let subiuDeNivel = false;

    while (gamificacao.pontos >= pontosNecessariosParaProximoNivel(gamificacao.nivel)) {
      gamificacao.pontos -= pontosNecessariosParaProximoNivel(gamificacao.nivel);
      gamificacao.nivel += 1;
      gamificacao.metas_batidas = Number(gamificacao.metas_batidas) + 1;
      subiuDeNivel = true;
    }

    gamificacao.atualizado_em = new Date();

    await gamificacao.save({ transaction: transacao });

    if (metaCallback) {
      await metaCallback(
        { usuarioId, pontos: pontosParaAdicionar, subiuDeNivel, gamificacao },
        transacao
      );
    }

    if (criouTransacao) await transacao.commit();

    return {
      gamificacao,
      subiuDeNivel,
      leveled: subiuDeNivel 
    };
  } catch (erro) {
    if (criouTransacao && transacao) await transacao.rollback();
    throw erro;
  }
}

/**
 * Retorna a gamificação de um usuário.
 */
async function buscarPorUsuario(usuarioId) {
  let gamificacao = await Gamificacao.findOne({ where: { usuario_id: usuarioId } });

  if (!gamificacao) {
    gamificacao = await Gamificacao.create({ usuario_id: usuarioId });
  }

  return gamificacao;
}

module.exports = {
  adicionarPontos,
  buscarPorUsuario,
  pontosNecessariosParaProximoNivel
};
