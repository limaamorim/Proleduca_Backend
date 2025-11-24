// src/services/metaService.js
const { Op } = require('sequelize');
const { connection } = require('../database');
const Meta = require('../models/Meta');
const UsuarioMeta = require('../models/UsuarioMeta');
const Indicacao = require('../models/Indicacao');
const impactoService = require('./impactoService'); 
const gamificacaoService = require('./gamificacaoService');

/**
 * Retorna a janela temporal de acordo com a periodicidade da meta.
 * tipos: diaria | semanal | mensal | unica
 */
function obterJanelaPorTipo(tipo) {
  const agora = new Date();
  let inicio = null;

  if (tipo === 'diaria') {
    inicio = new Date(agora);
    inicio.setHours(0, 0, 0, 0);

  } else if (tipo === 'semanal') {
    inicio = new Date(agora);
    inicio.setDate(agora.getDate() - 6); // últimos 7 dias
    inicio.setHours(0, 0, 0, 0);

  } else if (tipo === 'mensal') {
    inicio = new Date(agora);
    inicio.setDate(agora.getDate() - 29); // últimos 30 dias
    inicio.setHours(0, 0, 0, 0);
  }

  // 'unica' -> retorna null (contagem histórica)
  return inicio ? { inicio, fim: agora } : null;
}

/**
 * Reavalia TODAS as metas do usuário e atualiza usuario_metas.
 * Pode operar dentro de uma transação externa.
 */
async function avaliarMetasDoUsuario(usuarioId, transacaoExterna = null) {
  if (!usuarioId) throw new Error('usuarioId é obrigatório');

  const transacao = transacaoExterna || await connection.transaction();
  const criouTransacao = !transacaoExterna;

  try {
    const agora = new Date();

    // Busca todas as metas ativas e válidas no período
    const metas = await Meta.findAll({
      where: {
        ativo: true,
        [Op.and]: [
          { [Op.or]: [{ inicio_validade: null }, { inicio_validade: { [Op.lte]: agora } }] },
          { [Op.or]: [{ fim_validade: null }, { fim_validade: { [Op.gte]: agora } }] }
        ]
      },
      transaction: transacao
    });

    const resultados = [];

    for (const meta of metas) {
      const janela = obterJanelaPorTipo(meta.tipo_periodicidade);

      // Monta filtro das indicações validadas do usuário
      const filtro = {
        usuario_id: usuarioId,
        validada: true
      };

      if (janela) {
        filtro.validada_em = { [Op.between]: [janela.inicio, janela.fim] };
      }

      const qtdValidadas = await Indicacao.count({
        where: filtro,
        transaction: transacao
      });

      // Procurar registro do progresso do usuário
      let usuarioMeta = await UsuarioMeta.findOne({
        where: { usuario_id: usuarioId, meta_id: meta.id },
        transaction: transacao
      });

      let periodoInicio = janela ? janela.inicio : null;
      let periodoFim = janela ? janela.fim : null;

      let completouAgora = false;

      if (!usuarioMeta) {
        // Criar novo registro
        const completada = qtdValidadas >= meta.alvo_indicacoes;
        usuarioMeta = await UsuarioMeta.create({
          usuario_id: usuarioId,
          meta_id: meta.id,
          progresso_indicacoes: qtdValidadas,
          completado: completada,
          ganho: completada ? Number(meta.recompensa) : 0,
          periodo_inicio: periodoInicio,
          periodo_fim: periodoFim,
          ganho_creditado: false,
          criado_em: new Date(),
          atualizado_em: new Date()
        }, { transaction: transacao });

        if (completada) completouAgora = true;

      } else {
        // Atualizar registro existente
        const estavaCompleta = Boolean(usuarioMeta.completado);
        let precisaResetar = false;

        if (janela) {
          if (!usuarioMeta.periodo_inicio ||
              new Date(usuarioMeta.periodo_inicio).getTime() < periodoInicio.getTime()) {
            precisaResetar = true;
          }
        }

        if (precisaResetar) {
          usuarioMeta.progresso_indicacoes = qtdValidadas;
          usuarioMeta.periodo_inicio = periodoInicio;
          usuarioMeta.periodo_fim = periodoFim;
        } else {
          usuarioMeta.progresso_indicacoes = qtdValidadas;
        }

        usuarioMeta.completado = qtdValidadas >= meta.alvo_indicacoes;
        usuarioMeta.ganho = usuarioMeta.completado ? Number(meta.recompensa) : 0;

        if (!estavaCompleta && usuarioMeta.completado) {
          completouAgora = true;
        }

        usuarioMeta.atualizado_em = new Date();
        await usuarioMeta.save({ transaction: transacao });
      }

      // Creditar recompensas
      if (completouAgora && !usuarioMeta.ganho_creditado) {

        // 1. Impacto financeiro
        await impactoService.adicionarRecompensa(usuarioId, Number(meta.recompensa), transacao);

        // 2. Pontos da gamificação
        const pontos = Math.round(Number(meta.recompensa || 0));
        if (pontos > 0) {
          await gamificacaoService.adicionarPontos(usuarioId, pontos, null, transacao);
        }

        // 3. Marcar ganho como creditado
        usuarioMeta.ganho_creditado = true;
        usuarioMeta.atualizado_em = new Date();
        await usuarioMeta.save({ transaction: transacao });
      }

      resultados.push({
        meta: meta.toJSON(),
        usuario_meta: usuarioMeta.toJSON()
      });
    }

    if (criouTransacao) await transacao.commit();
    return resultados;

  } catch (erro) {
    if (criouTransacao) await transacao.rollback();
    throw erro;
  }
}

/**
 * Reivindica a recompensa da meta (marcar como recebido).
 * Aqui apenas muda o campo — lógica financeira real pode ser implementada depois.
 */
async function reivindicarMeta(usuarioId, metaId) {
  const transacao = await connection.transaction();
  try {
    const usuarioMeta = await UsuarioMeta.findOne({
      where: { usuario_id: usuarioId, meta_id: metaId },
      transaction: transacao
    });

    if (!usuarioMeta) throw new Error('Meta do usuário não encontrada.');
    if (!usuarioMeta.completado) throw new Error('Meta ainda não foi completada.');
    if (usuarioMeta.recebido) throw new Error('Meta já foi reivindicada.');

    usuarioMeta.recebido = true;
    usuarioMeta.atualizado_em = new Date();

    await usuarioMeta.save({ transaction: transacao });

    await transacao.commit();
    return usuarioMeta;

  } catch (erro) {
    await transacao.rollback();
    throw erro;
  }
}

module.exports = {
  avaliarMetasDoUsuario,
  reivindicarMeta
};
