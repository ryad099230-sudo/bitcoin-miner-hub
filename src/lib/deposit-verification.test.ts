import { describe, it, expect, vi } from "vitest";
import { checkOwnedDeposit } from "./deposit-verification";

const row = { id: "deposit-1", user_id: "owner", status: "awaiting_payment" };
const hash = "a".repeat(64);
describe("User-triggered deposit verification", () => {
  it("sends only the request ID and hash, never amounts or USD", async () => {
    const invoke = vi.fn().mockResolvedValue({ status: "confirming" });
    await checkOwnedDeposit({ userId: "owner", deposit: row, txHash: ` ${hash} `, invoke, readOwned: async () => row });
    expect(invoke).toHaveBeenCalledWith({ deposit_id: "deposit-1", tx_hash: hash });
  });
  it("does not invoke verification for another user's deposit", async () => {
    const invoke = vi.fn();
    await expect(checkOwnedDeposit({ userId: "other", deposit: row, txHash: hash, invoke, readOwned: async () => row })).rejects.toThrow("Forbidden");
    expect(invoke).not.toHaveBeenCalled();
  });
  it("rejects malformed hashes before invoking the server", async () => {
    const invoke = vi.fn();
    await expect(checkOwnedDeposit({ userId: "owner", deposit: row, txHash: "invalid", invoke, readOwned: async () => row })).rejects.toThrow("Invalid");
    expect(invoke).not.toHaveBeenCalled();
  });
  it("does not treat a claimed HTTP confirmation as a credited deposit", async () => {
    const result = await checkOwnedDeposit({ userId: "owner", deposit: row, txHash: hash, invoke: async () => ({ status: "confirmed" }), readOwned: async () => row });
    expect(result.outcome).toBe("submitted");
  });
  it("confirms only after reading the owner's confirmed database row", async () => {
    const readOwned = vi.fn().mockResolvedValue({ ...row, status: "confirmed" });
    const result = await checkOwnedDeposit({ userId: "owner", deposit: row, txHash: hash, invoke: async () => ({}), readOwned });
    expect(result.outcome).toBe("confirmed");
    expect(readOwned).toHaveBeenCalledWith("deposit-1", "owner");
  });
  it("distinguishes underpaid transfers from confirmation", async () => {
    const result = await checkOwnedDeposit({ userId: "owner", deposit: row, txHash: hash, invoke: async () => ({ status: "underpaid", success: false }), readOwned: async () => row });
    expect(result.outcome).toBe("underpaid");
  });
  it("keeps a transfer with insufficient confirmations pending", async () => {
    const result = await checkOwnedDeposit({ userId: "owner", deposit: row, txHash: hash, invoke: async () => ({ status: "confirming" }), readOwned: async () => ({ ...row, status: "confirming" }) });
    expect(result.outcome).toBe("confirming");
  });
  it("propagates provider failure without returning confirmation", async () => {
    await expect(checkOwnedDeposit({ userId: "owner", deposit: row, txHash: hash, invoke: async () => { throw new Error("Provider unavailable"); }, readOwned: async () => row })).rejects.toThrow("Provider unavailable");
  });
});