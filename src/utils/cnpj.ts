/**
 * Valida CNPJ pelo algoritmo oficial da Receita Federal.
 * Aceita o CNPJ com ou sem pontuação.
 */
export function validateCnpj(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');

  if (digits.length !== 14) return false;

  // Rejeita CNPJs com todos os dígitos iguais (ex: 00000000000000)
  if (/^(\d)\1+$/.test(digits)) return false;

  const calcDigit = (cnpj: string, length: number): number => {
    let sum = 0;
    let pos = length - 7;
    for (let i = length; i >= 1; i--) {
      sum += parseInt(cnpj.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11);
  };

  if (calcDigit(digits, 12) !== parseInt(digits.charAt(12))) return false;
  if (calcDigit(digits, 13) !== parseInt(digits.charAt(13))) return false;

  return true;
}
