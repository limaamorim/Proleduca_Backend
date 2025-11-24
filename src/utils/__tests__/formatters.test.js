// src/utils/__tests__/formatters.test.js
const { formatarCPF, formatarTelefone } = require('../formatters');

describe('Formatters', () => {
  describe('formatarCPF', () => {
    test('deve remover formatação de CPF com pontos e traços', () => {
      expect(formatarCPF('119.999.988-88')).toBe('11999998888');
    });

    test('deve retornar CPF sem formatação como está', () => {
      expect(formatarCPF('11999998888')).toBe('11999998888');
    });

    test('deve remover espaços do CPF', () => {
      expect(formatarCPF('119 999 988 88')).toBe('11999998888');
    });

    test('deve retornar null se CPF for null', () => {
      expect(formatarCPF(null)).toBe(null);
    });

    test('deve retornar undefined se CPF for undefined', () => {
      expect(formatarCPF(undefined)).toBe(undefined);
    });

    test('deve retornar string vazia se CPF for string vazia', () => {
      expect(formatarCPF('')).toBe('');
    });

    test('deve converter número para string e formatar', () => {
      expect(formatarCPF(11999998888)).toBe('11999998888');
    });
  });

  describe('formatarTelefone', () => {
    test('deve formatar telefone com parênteses e traços', () => {
      expect(formatarTelefone('(11) 99999-8888')).toBe('+5511999998888');
    });

    test('deve adicionar +55 para telefone sem código do país', () => {
      expect(formatarTelefone('11999998888')).toBe('+5511999998888');
    });

    test('deve manter +55 se já existir', () => {
      expect(formatarTelefone('+5511999998888')).toBe('+5511999998888');
    });

    test('deve adicionar + para telefone que começa com 55', () => {
      expect(formatarTelefone('5511999998888')).toBe('+5511999998888');
    });

    test('deve remover zero inicial do telefone', () => {
      expect(formatarTelefone('011999998888')).toBe('+5511999998888');
    });

    test('deve formatar telefone com formatação brasileira', () => {
      expect(formatarTelefone('(11) 98765-4321')).toBe('+5511987654321');
    });

    test('deve retornar null se telefone for null', () => {
      expect(formatarTelefone(null)).toBe(null);
    });

    test('deve retornar undefined se telefone for undefined', () => {
      expect(formatarTelefone(undefined)).toBe(undefined);
    });

    test('deve retornar string vazia se telefone for string vazia', () => {
      expect(formatarTelefone('')).toBe('');
    });

    test('deve formatar telefone com apenas números', () => {
      expect(formatarTelefone('11987654321')).toBe('+5511987654321');
    });

    test('deve tratar telefone com código do país já incluído (12+ dígitos)', () => {
      expect(formatarTelefone('55119999988888')).toBe('+55119999988888');
    });
  });
});

