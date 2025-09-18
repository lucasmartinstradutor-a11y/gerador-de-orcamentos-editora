/**
 * Formats a number into a Brazilian Real (BRL) currency string.
 * @param value The number to format.
 * @returns A string formatted as R$ X.XXX,XX.
 */
export const formatCurrencyBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formats an integer using the Brazilian Portuguese locale for thousand separators.
 * @param value The integer to format.
 * @returns A string with dot separators for thousands, e.g., 30.000.
 */
export const formatIntegerBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(Math.round(value));
};
