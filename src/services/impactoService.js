// src/services/impactService.js
const { connection } = require('../database/index');
const Indicacao = require('../models/Indicacao');
const Impacto = require('../models/Impacto');
const Config = require('../models/ConfigGamificacao');

/**
 * Busca valor de configuração na tabela de parâmetros.
 * Retorna fallback caso não exista.
 */
async function obterConfig(chave, valorPadrao = null, transacao = null) {
  const linha = await Config.findOne({
    where: { chave },
    transaction: transacao
  });
  return linha ? linha.valor : valorPadrao;
}

/**
 * Calcula o valor total gerado baseado na quantidade de indicações válidas.
 */
function calcularTotalMonetario(qtdValidas, recompensaBase, recompensaAlta, limiteAlta) {
  recompensaBase = Number(recompensaBase || 0);
  recompensaAlta = Number(recompensaAlta || 0);
  limiteAlta = Number(limiteAlta || 0);

  // Antes de atingir o limite
  if (qtdValidas <= Math.max(limiteAlta - 1, 0)) {
    return qtdValidas * recompensaBase;
  } 
  
  // Depois do limite
  const antesDoLimite = Math.max(limiteAlta - 1, 0);
  return (antesDoLimite * recompensaBase) + ((qtdValidas - antesDoLimite) * recompensaAlta);
}

/**
 * Recalcula o impacto total de um usuário (quantidade de indicações e renda gerada).
 * Pode receber uma transação externa.
 */
async function recalcularImpactoUsuario(usuarioId, transacaoExterna = null) {
  if (!usuarioId) throw new Error('usuarioId é obrigatório');

  let transacao;
  let criouTransacao = false;

  try {
    // Decide se usa transação externa ou cria uma interna
    if (transacaoExterna) {
      transacao = transacaoExterna;
    } else {
      transacao = await connection.transaction();
      criouTransacao = true;
    }

    // Conta indicações validadas
    const qtdValidas = await Indicacao.count({
      where: { usuario_id: usuarioId, validada: true },
      transaction: transacao
    });

    // Busca parâmetros configuráveis
    const recompensaBase = await obterConfig('recompensa_base', '0', transacao);
    const recompensaAlta = await obterConfig('recompensa_alta', recompensaBase, transacao);
    const limiteAlta = await obterConfig('limiar_recompensa_alta', '5', transacao);

    // Calcula renda
    const rendaGerada = calcularTotalMonetario(qtdValidas, recompensaBase, recompensaAlta, limiteAlta);

    // Upsert de impacto
    await Impacto.upsert({
      usuario_id: usuarioId,
      indicacoes_count: qtdValidas,
      bolsas_concedidas: qtdValidas,
      renda_gerada: rendaGerada,
      atualizado_em: new Date()
    }, { transaction: transacao });

    if (criouTransacao) await transacao.commit();

    return {
      usuario_id: usuarioId,
      indicacoes_count: qtdValidas,
      renda_gerada: rendaGerada
    };
  } catch (erro) {
    if (criouTransacao && transacao) await transacao.rollback();
    throw erro;
  }
}

/**
 * Verifica se o usuário pode sacar valores.
 */
async function usuarioPodeSacar(usuarioId) {
  const impacto = await Impacto.findOne({
    where: { usuario_id: usuarioId }
  });

  const minimoParaSaque = Number(await obterConfig('minimo_saque', '0'));
  const renda = impacto ? Number(impacto.renda_gerada || 0) : 0;

  return {
    pode_sacar: renda >= minimoParaSaque,
    renda,
    minimo: minimoParaSaque
  };
}

/**
 * Adiciona recompensa manualmente ao usuário.
 * Pode usar transação externa.
 */
async function adicionarRecompensa(usuarioId, valor, transacaoExterna = null) {
  if (!usuarioId) throw new Error('usuarioId é obrigatório');

  const valorNum = Number(valor || 0);
  if (isNaN(valorNum) || valorNum <= 0) return null;

  let transacao;
  let criouTransacao = false;

  try {
    if (transacaoExterna) {
      transacao = transacaoExterna;
    } else {
      transacao = await connection.transaction();
      criouTransacao = true;
    }

    // Busca impacto existente
    let impacto = await Impacto.findOne({
      where: { usuario_id: usuarioId },
      transaction: transacao
    });

    if (!impacto) {
      // Cria novo registro de impacto
      impacto = await Impacto.create({
        usuario_id: usuarioId,
        indicacoes_count: 0,
        bolsas_concedidas: 1,
        renda_gerada: valorNum,
        criado_em: new Date(),
        atualizado_em: new Date()
      }, { transaction: transacao });
    } else {
      // Atualiza impacto existente
      impacto.renda_gerada = Number(impacto.renda_gerada || 0) + valorNum;
      impacto.bolsas_concedidas = Number(impacto.bolsas_concedidas || 0) + 1;
      impacto.atualizado_em = new Date();

      await impacto.save({ transaction: transacao });
    }

    if (criouTransacao) await transacao.commit();
    return impacto;

  } catch (erro) {
    if (criouTransacao && transacao) await transacao.rollback();
    throw erro;
  }
}

module.exports = {
  recalcularImpactoUsuario,
  usuarioPodeSacar,
  calcularTotalMonetario,
  adicionarRecompensa
};
