// src/services/gamificacaoService.js
const Gamificacao = require('../models/Gamificacao');
const connection = require('../database/index').connection;

/**
 * Simples regra de pontos para próximo nível; parametrizável no futuro.
 */
function pontosParaProximoNivel(nivel) {
  return nivel * 100;
}

/**
 * Adiciona pontos. Aceita transaction opcional para ser chamado atomicamente junto com validação.
 * metaCallback recebe (meta, transaction) e pode executar ações dentro da mesma tx.
 */
async function adicionarPontos(usuarioId, pontos, metaCallback = null, externalTransaction = null) {
  if (!usuarioId) throw new Error('usuarioId é obrigatório');

  let t;
  let createdTx = false;
  try {
    if (externalTransaction) {
      t = externalTransaction;
    } else {
      t = await connection.transaction();
      createdTx = true;
    }

    let g = await Gamificacao.findOne({ where: { usuario_id: usuarioId }, transaction: t });
    if (!g) {
      g = await Gamificacao.create({ usuario_id: usuarioId, pontos: 0 }, { transaction: t });
    }

    g.pontos = Number(g.pontos) + Number(pontos);

    let leveled = false;
    while (g.pontos >= pontosParaProximoNivel(g.nivel)) {
      g.pontos = g.pontos - pontosParaProximoNivel(g.nivel);
      g.nivel = g.nivel + 1;
      g.metas_batidas = Number(g.metas_batidas) + 1;
      leveled = true;
    }

    g.atualizado_em = new Date();
    await g.save({ transaction: t });

    if (metaCallback) await metaCallback({ usuarioId, pontos, leveled, gamificacao: g }, t);

    if (createdTx) await t.commit();
    return { gamificacao: g, leveled };
  } catch (err) {
    if (createdTx && t) await t.rollback();
    throw err;
  }
}

async function getByUsuario(usuarioId) {
  let g = await Gamificacao.findOne({ where: { usuario_id: usuarioId } });
  if (!g) {
    g = await Gamificacao.create({ usuario_id: usuarioId });
  }
  return g;
}

module.exports = { adicionarPontos, getByUsuario, pontosParaProximoNivel };
