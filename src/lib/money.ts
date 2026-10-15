import Decimal from "decimal.js";

export const MAX_INVESTMENT = 1_000_000;

export type CalcResult = { initial: string; profit: string; total: string };

/** Simple (non-compounding) illustrative interest using exact decimal arithmetic. */
export function calculateIllustrative(amount: string | number, monthlyRate: string | number, months: number): CalcResult | null {
  let a: Decimal;
  let r: Decimal;
  try {
    a = new Decimal(amount);
    r = new Decimal(monthlyRate);
  } catch {
    return null;
  }
  if (!a.isFinite() || a.isNegative() || a.gt(MAX_INVESTMENT) || r.isNegative() || !Number.isInteger(months) || months < 1 || months > 120) return null;
  const profit = a.mul(r).mul(months).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const initial = a.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  return { initial: initial.toFixed(2), profit: profit.toFixed(2), total: initial.plus(profit).toFixed(2) };
}

export function formatUSD(v: string | number | null | undefined, lang: "ar" | "en" = "en") {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat(lang === "ar" ? "ar-EG-u-nu-latn" : "en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function referralCommission(basis: string | number, rate: string | number) {
  return new Decimal(basis).mul(rate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
}
