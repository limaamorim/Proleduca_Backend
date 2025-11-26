// src/utils/metaHelpers.js
const { Op } = require('sequelize');
const Meta = require('../models/Meta');
const UsuarioMeta = require('../models/UsuarioMeta');
const Indicacao = require('../models/Indicacao');
const Gamificacao = require('../models/Gamificacao');
const impactoService = require('../services/impactoService');
const gamificacaoService = require('../services/gamificacaoService');

/**
 * Fallbacks robustos para funções de serviço
 */
const impactoAdicionarRecompensa =
  (impactoService &&
    (impactoService.adicionarRecompensa ||
     impactoService.addReward ||
     impactoService.add_recompensa)) || null;

const gamificacaoAdicionarPontos =
  (gamificacaoService &&
    (gamificacaoService.adicionarPontos ||
     gamificacaoService.addPoints ||
     gamificacaoService.addPontos)) || null;

/**
 * Retorna metas ativas (considerando validade) dentro de uma transação opcional
 */
async function obterMetasAtivas(agora = new Date(), transacao = null) {
  return await Meta.findAll({
    where: {
      ativo: true,
      [Op.and]: [
        { [Op.or]: [{ inicio_validade: null }, { inicio_validade: { [Op.lte]: agora } }] },
        { [Op.or]: [{ fim_validade: null }, { fim_validade: { [Op.gte]: agora } }] }
      ]
    },
    transaction: transacao
  });
}

/**
 * Calcula janela por tipo (diaria/semanal/mensal/unica)
 */
function obterJanelaPorTipo(tipo) {
  const agora = new Date();
  let inicio = null;

  if (tipo === 'diaria') {
    inicio = new Date(agora); inicio.setHours(0,0,0,0);
  } else if (tipo === 'semanal') {
    inicio = new Date(agora); inicio.setDate(agora.getDate() - 6); inicio.setHours(0,0,0,0);
  } else if (tipo === 'mensal') {
    inicio = new Date(agora); inicio.setDate(agora.getDate() - 29); inicio.setHours(0,0,0,0);
  }
  return inicio ? { inicio, fim: agora } : null;
}

/**
 * Conta indicações validadas de um usuário dentro de uma janela (se fornecida)
 */
async function contarIndicacoesNaJanela(usuarioId, janela = null, transacao = null) {
  const where = { usuario_id: usuarioId, validada: true };
  if (janela) where.validada_em = { [Op.between]: [janela.inicio, janela.fim] };
  return await Indicacao.count({ where, transaction: transacao });
}

/**
 * Obter ou criar registro em usuario_metas
 */
async function obterOuCriarUsuarioMeta(usuarioId, metaId, transacao = null) {
  let um = await UsuarioMeta.findOne({ where: { usuario_id: usuarioId, meta_id: metaId }, transaction: transacao });
  if (!um) {
    um = await UsuarioMeta.create({
      usuario_id: usuarioId,
      meta_id: metaId,
      progresso_indicacoes: 0,
      completado: false,
      recebido: false,
      ganho: 0.00,
      ganho_creditado: false,
      periodo_inicio: null,
      periodo_fim: null,
      criado_em: new Date(),
      atualizado_em: new Date()
    }, { transaction: transacao });
  }
  return um;
}

/**
 * Atualiza usuario_meta e detecta transição para completado (newlyCompleted)
 * Retorna { usuarioMetaAtualizado, newlyCompleted }
 */
async function atualizarUsuarioMeta(usuarioMeta, qtdValidadas, meta, janela = null, transacao = null) {
  let precisarResetar = false;
  let periodoInicio = null, periodoFim = null;

  if (janela) {
    periodoInicio = janela.inicio;
    periodoFim = janela.fim;

    if (!usuarioMeta.periodo_inicio ||
        new Date(usuarioMeta.periodo_inicio).getTime() < periodoInicio.getTime()) {
      precisarResetar = true;
    }
  }

  const estavaCompleta = Boolean(usuarioMeta.completado);
  let newlyCompleted = false;

  if (precisarResetar) {
    const completada = qtdValidadas >= meta.alvo_indicacoes;
    usuarioMeta.progresso_indicacoes = qtdValidadas;
    usuarioMeta.periodo_inicio = periodoInicio;
    usuarioMeta.periodo_fim = periodoFim;
    usuarioMeta.completado = completada;
    usuarioMeta.ganho = completada ? Number(meta.recompensa) : 0.00;
  } else {
    usuarioMeta.progresso_indicacoes = qtdValidadas;
    usuarioMeta.completado = qtdValidadas >= meta.alvo_indicacoes;
    usuarioMeta.ganho = usuarioMeta.completado ? Number(meta.recompensa) : 0.00;
  }

  if (!estavaCompleta && usuarioMeta.completado) newlyCompleted = true;

  usuarioMeta.atualizado_em = new Date();
  await usuarioMeta.save({ transaction: transacao });

  return { usuarioMetaAtualizado: usuarioMeta, newlyCompleted };
}

/**
 * Aplica recompensa (financeira + pontos)
 */
async function aplicarRecompensaSeNecessaria(usuarioId, usuarioMeta, meta, transacao = null) {
  if (!usuarioMeta.completado) return usuarioMeta;
  if (Boolean(usuarioMeta.ganho_creditado)) return usuarioMeta;

  // Impacto
  if (!impactoAdicionarRecompensa) {
    throw new Error('Função de adicionar recompensa não encontrada em impactoService.');
  }
  await impactoAdicionarRecompensa(usuarioId, Number(meta.recompensa), transacao);

  // Pontos
  const pontos = Math.round(Number(meta.recompensa || 0));
  let resultadoGamificacao = null;

  if (pontos > 0) {
    if (!gamificacaoAdicionarPontos) {
      throw new Error('Função de adicionar pontos não encontrada em gamificacaoService.');
    }
    resultadoGamificacao = await gamificacaoAdicionarPontos(usuarioId, pontos, null, transacao);
  }

  const subiu = resultadoGamificacao &&
                (resultadoGamificacao.subiuDeNivel === true ||
                 resultadoGamificacao.leveled === true);

  // Incrementa metas_batidas se não subiu de nível
  if (!subiu) {
    const gamificacao = await Gamificacao.findOne({ where: { usuario_id: usuarioId }, transaction: transacao });

    if (gamificacao) {
      gamificacao.metas_batidas = Number(gamificacao.metas_batidas || 0) + 1;
      gamificacao.atualizado_em = new Date();
      await gamificacao.save({ transaction: transacao });
    } else {
      await Gamificacao.create({
        usuario_id: usuarioId,
        nivel: 1,
        pontos: 0,
        metas_batidas: 1,
        criado_em: new Date(),
        atualizado_em: new Date()
      }, { transaction: transacao });
    }
  }

  // Marca como creditado
  usuarioMeta.ganho_creditado = true;
  usuarioMeta.atualizado_em = new Date();
  await usuarioMeta.save({ transaction: transacao });

  return usuarioMeta;
}

module.exports = {
  obterMetasAtivas,
  obterJanelaPorTipo,
  contarIndicacoesNaJanela,
  obterOuCriarUsuarioMeta,
  atualizarUsuarioMeta,
  aplicarRecompensaSeNecessaria
};
