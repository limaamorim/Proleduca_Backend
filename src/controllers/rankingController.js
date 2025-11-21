// src/controllers/rankingController.js
const { connection } = require('../database');
const { QueryTypes } = require('sequelize');

function getWindow(tipo) {
  const now = new Date();
  if (tipo === 'diario') {
    const inicio = new Date(now);
    inicio.setHours(0, 0, 0, 0);
    return { inicio, fim: now };
  }
  if (tipo === 'semanal') {
    const inicio = new Date(now);
    inicio.setDate(now.getDate() - 6);
    inicio.setHours(0, 0, 0, 0);
    return { inicio, fim: now };
  }
  if (tipo === 'mensal') {
    const inicio = new Date(now);
    inicio.setDate(now.getDate() - 29);
    inicio.setHours(0, 0, 0, 0);
    return { inicio, fim: now };
  }
  return null; // todos
}

async function runRanking(periodo) {
  const window = getWindow(periodo);

  let sql;
  let bind;

  if (window) {
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
    bind = [window.inicio.toISOString(), window.fim.toISOString()];
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
    bind = [];
  }

  const rows = await connection.query(sql, {
    bind,
    type: QueryTypes.SELECT
  });

  // atribuir ranking com empates (tied ranks)
  let rank = 0;
  let lastCount = null;
  let index = 0;

  const ranked = rows.map(r => {
    index++;
    if (lastCount === null || r.indicacoes_validadas < lastCount) {
      rank = index;
      lastCount = r.indicacoes_validadas;
    }
    return {
      rank,
      usuario_id: r.id,
      nome: r.nome,
      indicacoes_validadas: r.indicacoes_validadas
    };
  });

  return ranked;
}

module.exports = {
  async diario(req, res) {
    const data = await runRanking('diario');
    return res.json({ periodo: 'diario', data });
  },

  async semanal(req, res) {
    const data = await runRanking('semanal');
    return res.json({ periodo: 'semanal', data });
  },

  async mensal(req, res) {
    const data = await runRanking('mensal');
    return res.json({ periodo: 'mensal', data });
  },

  async todos(req, res) {
    const data = await runRanking('todos');
    return res.json({ periodo: 'todos', data });
  }
};
