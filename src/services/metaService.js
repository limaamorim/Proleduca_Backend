// src/services/metaService.js
const { Op } = require('sequelize');
const { connection } = require('../database');
const Meta = require('../models/Meta');
const UsuarioMeta = require('../models/UsuarioMeta');
const Indicacao = require('../models/Indicacao');
const impactService = require('./impactoService');
const gamService = require('./gamificacaoService');

function getWindowForTipo(tipo) {
  const now = new Date();
  let inicio = null;
  if (tipo === 'diaria') {
    inicio = new Date(now);
    inicio.setHours(0,0,0,0);
  } else if (tipo === 'semanal') {
    inicio = new Date(now);
    inicio.setDate(now.getDate() - 6); // últimos 7 dias incluindo hoje
    inicio.setHours(0,0,0,0);
  } else if (tipo === 'mensal') {
    inicio = new Date(now);
    inicio.setDate(now.getDate() - 29); // últimos 30 dias
    inicio.setHours(0,0,0,0);
  }
  // 'unica' -> return null window (conta total histórico)
  return inicio ? { inicio, fim: now } : null;
}

/**
 * Reavalia todas metas para um usuário e atualiza usuario_metas.
 * Pode ser chamado dentro de transação (externalTransaction) para atomicidade.
 */
async function evaluateMetasForUser(usuarioId, externalTransaction = null) {
  if (!usuarioId) throw new Error('usuarioId obrigatório');

  const t = externalTransaction || await connection.transaction();
  let createdTx = !externalTransaction;
  try {
    // pegar metas ativas (e dentro do período de validade, se informado)
    const now = new Date();
    const metas = await Meta.findAll({
      where: {
        ativo: true,
        [Op.and]: [
          { [Op.or]: [{ inicio_validade: null }, { inicio_validade: { [Op.lte]: now } }] },
          { [Op.or]: [{ fim_validade: null }, { fim_validade: { [Op.gte]: now } }] }
        ]
      },
      transaction: t
    });

    const results = [];

    for (const meta of metas) {
      const window = getWindowForTipo(meta.tipo_periodicidade);

      // contar indicações validadas do usuário na janela
      const where = {
        usuario_id: usuarioId,
        validada: true
      };
      if (window) {
        where.validada_em = { [Op.between]: [window.inicio, window.fim] };
      }

      const cnt_valid = await Indicacao.count({ where, transaction: t });

      // upsert usuario_meta (find or create)
      let um = await UsuarioMeta.findOne({
        where: { usuario_id: usuarioId, meta_id: meta.id },
        transaction: t
      });

      // preparar dados de período
      let periodo_inicio = null, periodo_fim = null;
      if (window) {
        periodo_inicio = window.inicio;
        periodo_fim = window.fim;
      }

      // flag para saber se a meta acabou de ser completada agora
      let newlyCompleted = false;

      if (!um) {
        // criar novo registro
        const completado = cnt_valid >= meta.alvo_indicacoes;
        const ganho = completado ? Number(meta.recompensa) : 0.00;
        um = await UsuarioMeta.create({
          usuario_id: usuarioId,
          meta_id: meta.id,
          progresso_indicacoes: cnt_valid,
          completado,
          ganho,
          periodo_inicio,
          periodo_fim,
          ganho_creditado: false,
          criado_em: new Date(),
          atualizado_em: new Date()
        }, { transaction: t });

        if (completado) newlyCompleted = true;
      } else {
        // já existe -> verificar se precisamos resetar (janela)
        let needsReset = false;
        if (window) {
          if (!um.periodo_inicio || new Date(um.periodo_inicio).getTime() < new Date(periodo_inicio).getTime()) {
            needsReset = true;
          }
        }

        const wasCompleted = Boolean(um.completado);

        if (needsReset) {
          um.progresso_indicacoes = cnt_valid;
          um.periodo_inicio = periodo_inicio;
          um.periodo_fim = periodo_fim;
          um.completado = cnt_valid >= meta.alvo_indicacoes;
          um.ganho = um.completado ? Number(meta.recompensa) : 0.00;
        } else {
          um.progresso_indicacoes = cnt_valid;
          um.completado = cnt_valid >= meta.alvo_indicacoes;
          um.ganho = um.completado ? Number(meta.recompensa) : 0.00;
        }

        // detecta transição false -> true
        if (!wasCompleted && um.completado) newlyCompleted = true;

        um.atualizado_em = new Date();
        await um.save({ transaction: t });
      }

      // Se a meta acabou de ser completada e ainda não creditamos o ganho, aplicar recompensa
      // evite duplicate credit: confere campo ganho_creditado (boolean)
      const ganhoCreditado = Boolean(um.ganho_creditado);
      if (newlyCompleted && !ganhoCreditado) {
        // 1) Creditar no impacto (renda + bolsa)
        try {
          await impactService.addReward(usuarioId, Number(meta.recompensa), t);
        } catch (err) {
          // se por algum motivo falhar, lançamos pra rollback
          throw new Error('Erro ao creditar recompensa no impacto: ' + (err.message||err));
        }

        // 2) Creditar pontos na gamificação
        // Regra: pontos ganhos = arredondamento do valor monetário (ajuste como preferir)
        const pontosFromRecompensa = Math.round(Number(meta.recompensa || 0));
        if (pontosFromRecompensa > 0) {
          await gamService.adicionarPontos(usuarioId, pontosFromRecompensa, null, t);
        } else {
          // ainda incrementa metas_batidas mesmo se pontos = 0 (gamService fará isso no level-up)
          // caso queira incrementar metas_batidas diretamente:
          // const g = await gamService.getByUsuario(usuarioId);
          // g.metas_batidas = Number(g.metas_batidas || 0) + 1;
          // await g.save({ transaction: t });
        }

        // 3) marca ganho_creditado
        um.ganho_creditado = true;
        um.atualizado_em = new Date();
        await um.save({ transaction: t });
      }

      // buscar registro atualizado para resposta
      const usuario_meta_json = um.toJSON ? um.toJSON() : um;
      results.push({ meta: meta.toJSON(), usuario_meta: usuario_meta_json });
    }

    if (createdTx) await t.commit();
    return results;
  } catch (err) {
    if (createdTx) await t.rollback();
    throw err;
  }
}


/**
 * Claim: marca recebido=true e (aqui) devolve objeto.
 * Em produção: fazer controle financeiro / pagamentos.
 */
async function claimMetaForUser(usuarioId, metaId) {
  const t = await connection.transaction();
  try {
    const um = await UsuarioMeta.findOne({ where: { usuario_id: usuarioId, meta_id: metaId }, transaction: t });
    if (!um) throw new Error('Registro de meta do usuário não encontrado');
    if (!um.completado) throw new Error('Meta não completada');
    if (um.recebido) throw new Error('Meta já reivindicada');

    um.recebido = true;
    um.atualizado_em = new Date();
    await um.save({ transaction: t });

    // aqui poderia delegar para um serviço financeiro / criar registro de saque

    await t.commit();
    return um;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

module.exports = {
  evaluateMetasForUser,
  claimMetaForUser
};
