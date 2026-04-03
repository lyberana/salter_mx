/**
 * Generates an order number in format ORD-{YYYYMM}-{NNNNN}
 * @param fecha - Date to extract year/month from
 * @param secuencial - Sequential number (1-based)
 * @returns Formatted order number string
 */
export function generateNumeroOrden(fecha: Date, secuencial: number): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const seq = String(secuencial).padStart(5, "0");
  return `ORD-${year}${month}-${seq}`;
}

/**
 * Calculates total weight from an array of envío weights
 * @param pesos - Array of weight values (as numbers or numeric strings)
 * @returns Total weight as a number
 */
export function calcularPesoTotal(pesos: (number | string)[]): number {
  return pesos.reduce<number>((sum, peso) => sum + Number(peso), 0);
}

/**
 * Validates that an order number matches the expected format
 */
export function isValidNumeroOrden(numero: string): boolean {
  return /^ORD-\d{6}-\d{5}$/.test(numero);
}
