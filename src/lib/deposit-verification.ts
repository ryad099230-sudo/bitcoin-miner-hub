import { validTransactionHash } from "./deposits";

type OwnedDeposit = { id: string; user_id: string; status: string };
export type VerificationOutcome = "confirmed" | "confirming" | "underpaid" | "submitted";

/** Dependency-injected contract: no client-provided financial data is forwarded. */
export async function checkOwnedDeposit<T extends OwnedDeposit>(options: {
  userId: string;
  deposit: T;
  txHash: string;
  invoke: (body: { deposit_id: string; tx_hash: string }) => Promise<unknown>;
  readOwned: (id: string, userId: string) => Promise<T>;
}): Promise<{ deposit: T; outcome: VerificationOutcome }> {
  if (options.deposit.user_id !== options.userId) throw new Error("Forbidden: deposit owner mismatch");
  if (!validTransactionHash(options.txHash)) throw new Error("Invalid tx hash");
  const response = await options.invoke({ deposit_id: options.deposit.id, tx_hash: options.txHash.trim() });
  const data = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const status = String(data['status'] ?? "");
  const underpaid = status === "underpaid" || /underpaid|insufficient/.test(String(data['code'] ?? data['error'] ?? ""));
  if (!underpaid && (data['error'] || data['success'] === false || data['ok'] === false)) throw new Error(String(data['error'] ?? data['message'] ?? "Verification failed"));
  const deposit = await options.readOwned(options.deposit.id, options.userId);
  if (deposit.user_id !== options.userId || deposit.id !== options.deposit.id) throw new Error("Forbidden: deposit owner mismatch");
  // Only persisted server-owned status establishes confirmation.
  const outcome = deposit.status === "confirmed" ? "confirmed" : underpaid ? "underpaid" : deposit.status === "confirming" || status === "confirming" ? "confirming" : "submitted";
  return { deposit, outcome };
}