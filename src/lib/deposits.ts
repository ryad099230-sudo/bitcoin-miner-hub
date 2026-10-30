import Decimal from "decimal.js";

export type DepositNetwork = { asset: string; network: string };

export function supportedDepositNetwork(n: DepositNetwork) {
  const network = n.network.toLowerCase().replace(/[ _-]/g, "");
  return (n.asset === "BTC" && ["bitcoin", "btc", "mainnet", "bitcoinmainnet"].includes(network)) ||
    (n.asset === "USDT" && ["tron", "trc20", "trontrc20"].includes(network));
}

export function validTransactionHash(hash: string) {
  return /^[a-fA-F0-9]{64}$/.test(hash.trim());
}

export function transactionExplorer(n: DepositNetwork, hash: string | null) {
  if (!hash || !supportedDepositNetwork(n) || !validTransactionHash(hash)) return null;
  return n.asset === "BTC" ? `https://mempool.space/tx/${hash.trim()}` : `https://tronscan.org/#/transaction/${hash.trim()}`;
}

export function validDepositAmount(amount: string, minimum: number, decimals: number) {
  if (!/^\d+(\.\d+)?$/.test(amount) || !Number.isInteger(decimals) || decimals < 0) return false;
  const value = new Decimal(amount);
  return value.isFinite() && value.gt(0) && value.gte(minimum) && value.lte(1_000_000) && value.decimalPlaces() <= decimals;
}

export function canRetryDeposit(d: { status: string; expires_at: string }, now = Date.now()) {
  return ["created", "awaiting_payment", "detected", "confirming"].includes(d.status) && new Date(d.expires_at).getTime() > now;
}

const errors: [RegExp, string, string][] = [
  [/insufficient|underpaid|amount.*(low|less)|المبلغ/, "المبلغ المستلم أقل من المطلوب؛ لم يُضف أي رصيد.", "Received amount is below the requested amount; no balance was credited."],
  [/duplicate|already.used|23505|reused/, "هذه المعاملة مستخدمة لطلب آخر.", "This transaction is already used for another request."],
  [/not.found|not_found|404|non.?2xx|failed to send|fetch|network|unavailable/, "تعذّر الوصول إلى خدمة التحقق أو العثور على المعاملة. لم يُؤكد الإيداع؛ يمكنك إعادة المحاولة.", "The verification service or transaction could not be reached. No deposit was confirmed; you can retry."],
  [/address|recipient|destination/, "عنوان المستلم لا يطابق طلب الإيداع.", "The recipient address does not match the deposit request."],
  [/forbidden|unauthorized|owner|jwt|401|403/, "غير مصرح بالتحقق من هذا الطلب. تأكد من تسجيل دخولك.", "You are not authorized to verify this request. Check your sign-in."],
  [/expired|closed|rejected/, "طلب الإيداع مغلق أو منتهي الصلاحية.", "The deposit request is closed or expired."],
  [/invalid.*hash|invalid.*tx/, "أدخل معرّف معاملة صالحاً من 64 خانة سداسية عشرية.", "Enter a valid 64-character hexadecimal transaction hash."],
  [/not enabled|not available/, "الإيداعات أو الشبكة غير مفعّلة حالياً.", "Deposits or this network are currently unavailable."],
];

export function depositErrorMessage(error: unknown, lang: "ar" | "en") {
  const message = typeof error === "string" ? error : error && typeof error === "object" && "message" in error ? String(error.message) : "";
  const match = errors.find(([pattern]) => pattern.test(message));
  return match ? match[lang === "ar" ? 1 : 2] : lang === "ar" ? "فشل التحقق أو حفظ الطلب. لم يُضف رصيد؛ أعد المحاولة لاحقاً." : "Verification or saving failed. No balance was credited; retry later.";
}

export function validateNetworkPatch(patch: Record<string, string | boolean>) {
  const result: Record<string, string | number | boolean> = { ...patch };
  for (const key of ["required_confirmations", "min_deposit", "min_withdrawal", "withdrawal_fee"]) {
    if (!(key in patch)) continue;
    const raw = String(patch[key]).trim();
    const value = Number(raw);
    if (!raw || !Number.isFinite(value) || value < 0 || (key === "required_confirmations" && (!Number.isInteger(value) || value < 1))) throw new Error("Invalid network settings");
    result[key] = value;
  }
  if (typeof result.deposit_address === "string") result.deposit_address = result.deposit_address.trim();
  return result;
}