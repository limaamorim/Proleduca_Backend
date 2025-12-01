// src/controllers/rankingController.js
const { connection } = require('../database');
const { QueryTypes } = require('sequelize');

// Calcula a janela de datas conforme o tipo
function obterJanela(periodo) {
  const agora = new Date();

  if (periodo === 'diario') {
    const inicio = new Date(agora);
    inicio.setHours(0, 0, 0, 0);
    return { inicio, fim: agora };
  }

  if (periodo === 'semanal') {
    const inicio = new Date(agora);
    inicio.setDate(agora.getDate() - 6);
    inicio.setHours(0, 0, 0, 0);
    return { inicio, fim: agora };
  }

  if (periodo === 'mensal') {
    const inicio = new Date(agora);
    inicio.setDate(agora.getDate() - 29);
    inicio.setHours(0, 0, 0, 0);
    return { inicio, fim: agora };
  }

  return null; // caso seja "todos"
}

// Executa o ranking conforme o período solicitado
async function executarRanking(periodo) {
  const janela = obterJanela(periodo);

  let sql;
  let parametros;

  if (janela) {
    sql = `
      SELECT u.id, u.nome,
             COALESCE(cnt.cnt, 0)::int AS indicacoes_validadas
      FROM usuarios u
      LEFT JOIN (
        SELECT usuario_id, COUNT(*) AS cnt
        FROM indicacoes
        WHERE validada = true
          AND validada_em BETWEEN $1 AND $2
        GROUP BY usuario_id
      ) cnt ON cnt.usuario_id = u.id
      ORDER BY cnt.cnt DESC NULLS LAST, u.nome ASC
    `;

    parametros = [
      janela.inicio.toISOString(),
      janela.fim.toISOString()
    ];

  } else {
    sql = `
      SELECT u.id, u.nome,
             COALESCE(cnt.cnt, 0)::int AS indicacoes_validadas
      FROM usuarios u
      LEFT JOIN (
        SELECT usuario_id, COUNT(*) AS cnt
        FROM indicacoes
        WHERE validada = true
        GROUP BY usuario_id
      ) cnt ON cnt.usuario_id = u.id
      ORDER BY cnt.cnt DESC NULLS LAST, u.nome ASC
    `;
    parametros = [];
  }

  const linhas = await connection.query(sql, {
    bind: parametros,
    type: QueryTypes.SELECT
  });

  // Aplica ranking com empates (mesmo número de indicações)
  let posicao = 0;
  let ultimoTotal = null;
  let indice = 0;

  const rankingFinal = linhas.map(linha => {
    indice++;
    if (ultimoTotal === null || linha.indicacoes_validadas < ultimoTotal) {
      posicao = indice;
      ultimoTotal = linha.indicacoes_validadas;
    }

    return {
      rank: posicao,
      usuario_id: linha.id,
      nome: linha.nome,
      indicacoes_validadas: linha.indicacoes_validadas
    };
  });

  return rankingFinal;
}

module.exports = {
  async diario(req, res) {
    const dados = await executarRanking('diario');
    return res.json({ periodo: 'diario', data: dados });
  },

  async semanal(req, res) {
    const dados = await executarRanking('semanal');
    return res.json({ periodo: 'semanal', data: dados });
  },

  async mensal(req, res) {
    const dados = await executarRanking('mensal');
    return res.json({ periodo: 'mensal', data: dados });
  },

  async todos(req, res) {
    const dados = await executarRanking('todos');
    return res.json({ periodo: 'todos', data: dados });
  }
};
