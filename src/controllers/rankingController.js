const { connection } = require('../database');
const { QueryTypes } = require('sequelize');

// Ranking com base na tabela gamificação:
async function executarRanking() {
  const sql = `
    SELECT 
      u.id,
      u.nome,
      COALESCE(g.pontos, 0)::int AS pontos,
      COALESCE(g.nivel, 1)::int AS nivel,
      COALESCE(g.metas_batidas, 0)::int AS metas_batidas
    FROM usuarios u
    LEFT JOIN gamificacao g ON g.usuario_id = u.id
    ORDER BY pontos DESC, nivel DESC, u.nome ASC;
  `;

  const rows = await connection.query(sql, { type: QueryTypes.SELECT });

  // Aplicar classificação
  let pos = 0;
  let lastPoints = null;
  let index = 0;

  const ranking = rows.map((row) => {
    index++;

    if (lastPoints === null || row.pontos < lastPoints) {
      pos = index;
      lastPoints = row.pontos;
    }

    return {
      rank: pos,
      usuario_id: row.id,
      nome: row.nome,
      pontos: row.pontos,
      nivel: row.nivel,
      metas_batidas: row.metas_batidas
    };
  });

  return ranking;
}

module.exports = {
  async diario(req, res) {
    const dados = await executarRanking();
    return res.json({ periodo: "diario", data: dados });
  },

  async semanal(req, res) {
    const dados = await executarRanking();
    return res.json({ periodo: "semanal", data: dados });
  },

  async mensal(req, res) {
    const dados = await executarRanking();
    return res.json({ periodo: "mensal", data: dados });
  },

  async todos(req, res) {
    const dados = await executarRanking();
    return res.json({ periodo: "todos", data: dados });
  }
};
