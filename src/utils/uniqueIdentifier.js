const crypto = require('crypto');

/**
 * Gera um identificador único baseado em CPF usando hash SHA256
 * 
 * Processo:
 * 1. Recebe o CPF
 * 2. Adiciona um salt
 * 3. Gera um hash SHA256
 * 4. Retorna o resultado
 * 
 * @param {string} cpf 
 * @returns {string}
 */

function gerarIdentificadorUnico(cpf) {
  if (!cpf) {
    throw new Error('CPF é obrigatório para gerar identificador único');
  }

  const SALT = process.env.JWT_SECRET || 'e_assim_italo_e_felipe_vivem_felizes_para_sempre';
  const dados = `${cpf}${SALT}`;
  const hash = crypto.createHash('sha256').update(dados, 'utf8').digest('base64url');

  return hash;
}

module.exports = {gerarIdentificadorUnico};