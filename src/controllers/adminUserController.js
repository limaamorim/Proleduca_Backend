// src/controllers/adminUserController.js
const Usuario = require('../models/Usuario');
const Gamificacao = require('../models/Gamificacao');
const Impacto = require('../models/Impacto');
const { calcularIdade } = require('../utils/calculoDeIdade');

module.exports = {

  // Lista todos os usuários (admin) com dados de gamificação agregados
  async listar(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: [
          'id','nome','email','telefone','cpf','data_nascimento',
          'link_indicacao','suspended','criado_em','atualizado_em'
        ],
        order: [['criado_em', 'DESC']]
      });

      // Obtém todos os IDs
      const idsUsuarios = usuarios.map(u => u.id);

      // Busca gamificação de todos os usuários em lote
      const gamificacoes = idsUsuarios.length
        ? await Gamificacao.findAll({
            where: { usuario_id: idsUsuarios },
            attributes: ['usuario_id', 'nivel', 'pontos', 'metas_batidas']
          })
        : [];

      // Cria mapa de gamificações { usuario_id -> dados }
      const mapaGamificacao = new Map();
      gamificacoes.forEach(g => mapaGamificacao.set(g.usuario_id, g.toJSON()));

      // Monta resposta final
      const resposta = usuarios.map(u => {
        const json = u.toJSON();
        json.idade = json.data_nascimento ? calcularIdade(json.data_nascimento) : null;
        json.gamificacao = mapaGamificacao.get(json.id) || null;
        return json;
      });

      return res.json(resposta);

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Retorna um único usuário (admin) com gamificação + impacto + idade
  async obter(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) {
        return res.status(400).json({ error: 'ID inválido.' });
      }

      const usuario = await Usuario.findByPk(id, {
        attributes: [
          'id','nome','email','telefone','cpf','data_nascimento',
          'link_indicacao','criado_em','atualizado_em','suspended'
        ]
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      // Busca gamificação e impacto paralelamente
      const [gamificacao, impacto] = await Promise.all([
        Gamificacao.findOne({
          where: { usuario_id: id },
          attributes: ['nivel', 'pontos', 'metas_batidas']
        }),
        Impacto.findOne({
          where: { usuario_id: id },
          attributes: ['indicacoes_count', 'renda_gerada', 'bolsas_concedidas']
        })
      ]);

      const json = usuario.toJSON();
      json.idade = json.data_nascimento ? calcularIdade(json.data_nascimento) : null;
      json.gamificacao = gamificacao ? gamificacao.toJSON() : null;
      json.impacto = impacto ? impacto.toJSON() : null;

      return res.json(json);

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Suspender ou reativar usuário
  async suspend(req, res) {
    try {
      const id = Number(req.params.id);
      const { suspended } = req.body; // booleano

      if (typeof suspended !== 'boolean') {
        return res.status(400).json({
          error: 'O campo "suspended" (booleano) é obrigatório.'
        });
      }

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      usuario.suspended = suspended;
      usuario.atualizado_em = new Date();
      await usuario.save();

      return res.json({
        message: `Usuário ${suspended ? 'suspenso' : 'reativado'} com sucesso.`,
        usuario: {
          id: usuario.id,
          suspended: usuario.suspended
        }
      });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Deletar usuário
  async deletar(req, res) {
    try {
      const id = Number(req.params.id);

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      await usuario.destroy();

      return res.json({ message: 'Usuário removido com sucesso!' });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

};
