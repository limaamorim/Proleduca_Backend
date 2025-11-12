// src/controllers/adminUserController.js
const Usuario = require('../models/Usuario');

module.exports = {
  // listar todos os usuários (admin)
  async listar(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: ['id','nome','email','telefone','cpf','idade','link_indicacao','criado_em','atualizado_em','suspended']
      });
      return res.json(usuarios);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // ver um usuário
  async obter(req, res) {
    try {
      const id = Number(req.params.id);
      const u = await Usuario.findByPk(id, {
        attributes: ['id','nome','email','telefone','cpf','idade','link_indicacao','criado_em','atualizado_em','suspended']
      });
      if (!u) return res.status(404).json({ error: 'Usuário não encontrado' });
      return res.json(u);
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
