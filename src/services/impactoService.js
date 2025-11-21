// src/services/impactService.js
const { connection } = require('../database/index');
const Indicacao = require('../models/Indicacao');
const Impacto = require('../models/Impacto');
const Config = require('../models/ConfigGamificacao');

async function getConfigValue(chave, fallback = null, transaction = null) {
  const row = await Config.findOne({ where: { chave }, transaction });
  return row ? row.valor : fallback;
}

function calcularTotalMonetario(cnt_valid, rewardBase, rewardHigh, threshold) {
  rewardBase = Number(rewardBase || 0);
  rewardHigh = Number(rewardHigh || 0);
  threshold = Number(threshold || 0);

  if (cnt_valid <= Math.max(threshold - 1, 0)) {
    return cnt_valid * rewardBase;
  } else {
    const before = Math.max(threshold - 1, 0);
    return (before * rewardBase) + ((cnt_valid - before) * rewardHigh);
  }
}

/**
 * Recompute impact. Accepts optional transaction to allow atomic caller.
 */
async function recomputeImpactForUser(usuarioId, externalTransaction = null) {
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

    // contar indicações validadas (dentro da transação)
    const cnt_valid = await Indicacao.count({
      where: { usuario_id: usuarioId, validada: true },
      transaction: t
    });

    // buscar parâmetros da config (dentro da transação quando possível)
    const rewardBase = await getConfigValue('recompensa_base', '0', t);
    const rewardHigh = await getConfigValue('recompensa_alta', rewardBase, t);
    const threshold = await getConfigValue('limiar_recompensa_alta', '5', t);

    const totalMoney = calcularTotalMonetario(cnt_valid, rewardBase, rewardHigh, threshold);

    // upsert impactos (utilizando transaction)
    await Impacto.upsert({
      usuario_id: usuarioId,
      indicacoes_count: cnt_valid,
      bolsas_concedidas: cnt_valid,
      renda_gerada: totalMoney,
      atualizado_em: new Date()
    }, { transaction: t });

    if (createdTx) await t.commit();

    return {
      usuario_id: usuarioId,
      indicacoes_count: cnt_valid,
      renda_gerada: totalMoney
    };
  } catch (err) {
    if (createdTx && t) await t.rollback();
    throw err;
  }
}

async function canUserWithdraw(usuarioId) {
  const impacto = await Impacto.findOne({ where: { usuario_id: usuarioId } });
  const minimo = Number(await getConfigValue('minimo_saque', '0'));
  const renda = impacto ? Number(impacto.renda_gerada || 0) : 0;
  return { pode_sacar: renda >= minimo, renda, minimo };
}


async function addReward(usuarioId, amount, externalTransaction = null) {
  if (!usuarioId) throw new Error('usuarioId é obrigatório');
  const valorNum = Number(amount || 0);
  if (isNaN(valorNum) || valorNum <= 0) return null;

  let t;
  let createdTx = false;
  try {
    if (externalTransaction) {
      t = externalTransaction;
    } else {
      t = await connection.transaction();
      createdTx = true;
    }

    // Tenta achar impacto
    let impacto = await Impacto.findOne({ where: { usuario_id: usuarioId }, transaction: t });

    if (!impacto) {
      impacto = await Impacto.create({
        usuario_id: usuarioId,
        indicacoes_count: 0,
        bolsas_concedidas: 1,
        renda_gerada: valorNum,
        criado_em: new Date(),
        atualizado_em: new Date()
      }, { transaction: t });
    } else {
      // incrementa renda e bolsas
      const novaRenda = Number(impacto.renda_gerada || 0) + valorNum;
      impacto.renda_gerada = novaRenda;
      impacto.bolsas_concedidas = Number(impacto.bolsas_concedidas || 0) + 1;
      impacto.atualizado_em = new Date();
      await impacto.save({ transaction: t });
    }

    if (createdTx) await t.commit();
    return impacto;
  } catch (err) {
    if (createdTx && t) await t.rollback();
    throw err;
  }
}

module.exports = {
  recomputeImpactForUser,
  canUserWithdraw,
  calcularTotalMonetario,
  addReward
};
