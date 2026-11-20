/**
 * Extra fuel needed per month when mileage drops by dropPct percent.
 * Returns null for invalid input (negative distance, non-positive mileage or price, drop outside 0 to <100).
 */
export function extraFuel({ km, mil, price, dropPct }) {
  const k = +km,
    m = +mil,
    p = +price,
    d = +dropPct / 100;
  if (!(k >= 0 && m > 0 && p > 0 && d >= 0 && d < 1)) return null;
  const litres = k / (m * (1 - d)) - k / m;
  return { litres, month: litres * p, year: litres * p * 12 };
}
