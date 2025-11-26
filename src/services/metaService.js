// src/services/metaService.js
const { connection } = require('../database');
const metaHelpers = require('../utils/metaHelpers');

/**
 * Reavalia TODAS as metas do usuário e atualiza usuario_metas.
 * Pode operar dentro de uma transação externa.
 *
 * Mantém compatibilidade com o nome português (avaliarMetasDoUsuario)
 * e com o nome antigo/inglês (evaluateMetasForUser).
 */
async function avaliarMetasDoUsuario(usuarioId, transacaoExterna = null) {
  if (!usuarioId) throw new Error('usuarioId é obrigatório');

  let transacao;
  let criouTransacao = false;
  try {
    if (transacaoExterna) {
      transacao = transacaoExterna;
    } else {
      transacao = await connection.transaction();
      criouTransacao = true;
    }

    const agora = new Date();
    const metas = await metaHelpers.obterMetasAtivas(agora, transacao);
    const resultados = [];

    for (const meta of metas) {
      const janela = metaHelpers.obterJanelaPorTipo(meta.tipo_periodicidade);

      const qtdValidadas = await metaHelpers.contarIndicacoesNaJanela(usuarioId, janela, transacao);

      let usuarioMeta = await metaHelpers.obterOuCriarUsuarioMeta(usuarioId, meta.id, transacao);

      const { usuarioMetaAtualizado, newlyCompleted } = await metaHelpers.atualizarUsuarioMeta(usuarioMeta, qtdValidadas, meta, janela, transacao);

      // aplicar recompensa (se completou agora e ainda não foi creditada) - dentro da transação
      if (newlyCompleted) {
        await metaHelpers.aplicarRecompensaSeNecessaria(usuarioId, usuarioMetaAtualizado, meta, transacao);
      }

      resultados.push({
        meta: meta.toJSON(),
        usuario_meta: usuarioMetaAtualizado.toJSON()
      });
    }

    if (criouTransacao) await transacao.commit();
    return resultados;
  } catch (erro) {
    if (criouTransacao && transacao) await transacao.rollback();
    throw erro;
  }
}


/**
 * Reivindica a recompensa da meta (marcar como recebido).
 */
async function reivindicarMeta(usuarioId, metaId) {
  const transacao = await connection.transaction();
  try {
    const UsuarioMeta = require('../models/UsuarioMeta');
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
  reivindicarMeta,
};
