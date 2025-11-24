/**
 * Formata CPF removendo todos os caracteres não numéricos
 * Formato de saída: "11999998888" (apenas números)
 * @param {string} cpf - CPF a ser formatado
 * @returns {string} CPF formatado apenas com números
 */
function formatarCPF(cpf) {
  if (!cpf) return cpf;
  
  return String(cpf).replace(/\D/g, '');
}

/**
 * Formata telefone para o padrão: "+5511999998888"
 * - Remove todos os caracteres não numéricos
 * - Adiciona +55 (código do Brasil) se não existir
 * @param {string} telefone - Telefone a ser formatado
 * @returns {string} Telefone formatado no padrão "+5511999998888"
 */
function formatarTelefone(telefone) {
  if (!telefone) return telefone;

  const apenasNumeros = String(telefone).replace(/\D/g, '');
  if (apenasNumeros.length >= 12 && apenasNumeros.startsWith('55')) {
    return `+${apenasNumeros}`;
  }
  const semZeroInicial = apenasNumeros.startsWith('0') ? apenasNumeros.substring(1) : apenasNumeros;
  return `+55${semZeroInicial}`;
}

module.exports = {
  formatarCPF,
  formatarTelefone
};

