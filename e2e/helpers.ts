/**
 * Gera um CNPJ válido (algoritmo Receita Federal) com base no timestamp atual.
 * A parte de raiz usa os últimos 8 dígitos do timestamp + "0001" (filial),
 * garantindo unicidade entre execuções.
 */
export function generateCnpj(): string {
  const root = String(Date.now() % 100_000_000).padStart(8, '0');
  const base = root + '0001'; // 12 dígitos

  const calcDigit = (n: string, len: number): number => {
    let sum = 0;
    let pos = len - 7;
    for (let i = len; i >= 1; i--) {
      sum += parseInt(n.charAt(len - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11);
  };

  const d1 = calcDigit(base, 12);
  const d2 = calcDigit(base + d1, 13);
  const digits = base + d1 + d2;

  return (
    `${digits.slice(0, 2)}.${digits.slice(2, 5)}.` +
    `${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
  );
}
