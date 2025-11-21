// src/controllers/adminUserController.js
const Usuario = require('../models/Usuario');
const Gamificacao = require('../models/Gamificacao');
const Impacto = require('../models/Impacto');
const { calcularIdade } = require('../utils/calculoDeIdade');

module.exports = {
  // listar todos os usuários (admin) - agora retorna gamificacao agregada
  async listar(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: [
          'id','nome','email','telefone','cpf','data_nascimento',
          'link_indicacao','suspended','criado_em','atualizado_em'
        ],
        order: [['criado_em','DESC']]
      });

      // pegar ids e buscar gamificações de uma vez só
      const usuarioIds = usuarios.map(u => u.id);
      const gamRows = usuarioIds.length
        ? await Gamificacao.findAll({
            where: { usuario_id: usuarioIds },
            attributes: ['usuario_id','nivel','pontos','metas_batidas']
          })
        : [];

      // transformar gamRows em mapa { usuario_id -> gam }
      const gamMap = new Map();
      gamRows.forEach(g => gamMap.set(g.usuario_id, g.toJSON()));

      const resposta = usuarios.map(u => {
        const json = u.toJSON();
        json.idade = json.data_nascimento ? calcularIdade(json.data_nascimento) : null;
        json.gamificacao = gamMap.get(json.id) || null;
        return json;
      });

      return res.json(resposta);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // ver um usuário (admin) - retorna usuario + gamificacao + impacto + idade
  async obter(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'id inválido' });

      const u = await Usuario.findByPk(id, {
        attributes: ['id','nome','email','telefone','cpf','data_nascimento','link_indicacao','criado_em','atualizado_em','suspended']
      });
      if (!u) return res.status(404).json({ error: 'Usuário não encontrado' });

      // Buscar gamificacao e impacto separadamente
      const [gam, impacto] = await Promise.all([
        Gamificacao.findOne({ where: { usuario_id: id }, attributes: ['nivel','pontos','metas_batidas'] }),
        Impacto.findOne({ where: { usuario_id: id }, attributes: ['indicacoes_count','renda_gerada','bolsas_concedidas'] })
      ]);

      const json = u.toJSON();
      json.idade = json.data_nascimento ? calcularIdade(json.data_nascimento) : null;
      json.gamificacao = gam ? gam.toJSON() : null;
      json.impacto = impacto ? impacto.toJSON() : null;

      return res.json(json);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Suspender ou reativar usuário (admin)
  async suspend(req, res) {
    try {
      const id = Number(req.params.id);
      const { suspended } = req.body; // boolean
      if (typeof suspended !== 'boolean') return res.status(400).json({ error: 'suspended (boolean) é obrigatório no body' });

      const u = await Usuario.findByPk(id);
      if (!u) return res.status(404).json({ error: 'Usuário não encontrado' });

      u.suspended = suspended;
      u.atualizado_em = new Date();
      await u.save();

      return res.json({ message: `Usuário ${suspended ? 'suspenso' : 'reativado'} com sucesso`, usuario: { id: u.id, suspended: u.suspended } });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Deletar usuario (admin)
  async deletar(req, res) {
    try {
      const id = Number(req.params.id);
      const u = await Usuario.findByPk(id);
      if (!u) return res.status(404).json({ error: 'Usuário não encontrado' });

      await u.destroy();
      return res.json({ message: 'Usuário removido com sucesso!' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
