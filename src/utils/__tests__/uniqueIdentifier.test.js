// src/utils/__tests__/uniqueIdentifier.test.js
const { gerarIdentificadorUnico } = require('../uniqueIdentifier');
const crypto = require('crypto');

describe('uniqueIdentifier', () => {
  const cpfTeste = '11999998888';
  const saltPadrao = 'e_assim_italo_e_felipe_vivem_felizes_para_sempre';

  test('deve gerar identificador único para um CPF', () => {
    const hash = gerarIdentificadorUnico(cpfTeste);
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  test('deve gerar hash em formato base64url (sem caracteres especiais de base64)', () => {
    const hash = gerarIdentificadorUnico(cpfTeste);
    // base64url não contém +, /, ou = no final
    expect(hash).not.toMatch(/\+|\//);
    expect(hash.endsWith('=')).toBe(false);
  });

  test('deve ser determinístico (mesmo CPF = mesmo hash)', () => {
    const hash1 = gerarIdentificadorUnico(cpfTeste);
    const hash2 = gerarIdentificadorUnico(cpfTeste);
    expect(hash1).toBe(hash2);
  });

  test('deve gerar hash diferente para CPFs diferentes', () => {
    const cpf1 = '11999998888';
    const cpf2 = '12345678901';
    const hash1 = gerarIdentificadorUnico(cpf1);
    const hash2 = gerarIdentificadorUnico(cpf2);
    expect(hash1).not.toBe(hash2);
  });

  test('deve lançar erro se CPF não for fornecido', () => {
    expect(() => gerarIdentificadorUnico(null)).toThrow('CPF é obrigatório');
    expect(() => gerarIdentificadorUnico(undefined)).toThrow('CPF é obrigatório');
    expect(() => gerarIdentificadorUnico('')).toThrow('CPF é obrigatório');
  });

  test('deve usar salt padrão quando JWT_SECRET não está definido', () => {
    const originalEnv = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    
    const hash = gerarIdentificadorUnico(cpfTeste);
    
    const hashEsperado = crypto
      .createHash('sha256')
      .update(`${cpfTeste}${saltPadrao}`, 'utf8')
      .digest('base64url');
    
    expect(hash).toBe(hashEsperado);
    
    if (originalEnv) {
      process.env.JWT_SECRET = originalEnv;
    }
  });

  test('deve usar JWT_SECRET como salt se estiver definido', () => {
    const originalEnv = process.env.JWT_SECRET;
    const saltCustomizado = 'meu-salt-customizado';
    process.env.JWT_SECRET = saltCustomizado;
    
    const hash = gerarIdentificadorUnico(cpfTeste);
    
    const hashEsperado = crypto
      .createHash('sha256')
      .update(`${cpfTeste}${saltCustomizado}`, 'utf8')
      .digest('base64url');
    
    expect(hash).toBe(hashEsperado);
    
    if (originalEnv) {
      process.env.JWT_SECRET = originalEnv;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  test('deve gerar hash SHA256 válido', () => {
    const hash = gerarIdentificadorUnico(cpfTeste);
    expect(hash.length).toBe(43);
  });

  test('deve aceitar CPF como string ou número', () => {
    const hashString = gerarIdentificadorUnico('11999998888');
    const hashNumber = gerarIdentificadorUnico(11999998888);
    expect(hashString).toBe(hashNumber);
  });
});

