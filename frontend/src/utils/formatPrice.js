// Safely convert price (number | string | Prisma Decimal) to a string with 2 decimals
export default function formatPrice(price) {
  try {
    if (price === null || price === undefined) return '0.00';
    // Prisma Decimal sometimes has toNumber/toString; attempt to coerce
    if (typeof price === 'object' && price !== null) {
      if (typeof price.toNumber === 'function') return String(price.toNumber().toFixed(2));
      if (typeof price.toString === 'function') {
        const parsed = parseFloat(price.toString());
        return Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00';
      }
    }
    const n = typeof price === 'number' ? price : parseFloat(String(price).replace(',', '.'));
    return Number.isFinite(n) ? n.toFixed(2) : '0.00';
  } catch (e) {
    return '0.00';
  }
}
