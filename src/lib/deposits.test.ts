import { describe, expect, it } from "vitest";
import { canRetryDeposit, supportedDepositNetwork, transactionExplorer, validDepositAmount, validTransactionHash, validateNetworkPatch } from "./deposits";

describe("Deposit safety rules", () => {
  it("rejects empty and invalid transaction hashes", () => {
    expect(validTransactionHash("")).toBe(false);
    expect(validTransactionHash("g".repeat(64))).toBe(false);
    expect(validTransactionHash("a".repeat(63))).toBe(false);
    expect(validTransactionHash("a".repeat(64))).toBe(true);
  });
  it("allows BTC Mainnet only for BTC", () => {
    expect(supportedDepositNetwork({ asset: "BTC", network: "Bitcoin Mainnet" })).toBe(true);
    expect(supportedDepositNetwork({ asset: "BTC", network: "testnet" })).toBe(false);
  });
  it("allows only TRON TRC-20 for USDT", () => {
    expect(supportedDepositNetwork({ asset: "USDT", network: "TRC-20" })).toBe(true);
    expect(supportedDepositNetwork({ asset: "USDT", network: "ERC-20" })).toBe(false);
  });
  it("rejects an amount below the configured minimum", () => {
    expect(validDepositAmount("0.009", 0.01, 8)).toBe(false);
    expect(validDepositAmount("0.01", 0.01, 8)).toBe(true);
  });
  it("uses exact asset precision", () => {
    expect(validDepositAmount("1.00000001", 0, 6)).toBe(false);
    expect(validDepositAmount("1.000001", 0, 6)).toBe(true);
  });
  it("never retries confirmed, rejected or expired requests", () => {
    const future = "2027-01-01T00:00:00Z", now = Date.parse("2026-10-30T00:00:00Z");
    for (const status of ["confirmed", "rejected", "expired"]) expect(canRetryDeposit({ status, expires_at: future }, now)).toBe(false);
    expect(canRetryDeposit({ status: "confirming", expires_at: future }, now)).toBe(true);
    expect(canRetryDeposit({ status: "confirming", expires_at: "2026-10-29T00:00:00Z" }, now)).toBe(false);
  });
  it("links only valid hashes to the correct network explorer", () => {
    const hash = "a".repeat(64);
    expect(transactionExplorer({ asset: "BTC", network: "Bitcoin" }, hash)).toBe(`https://mempool.space/tx/${hash}`);
    expect(transactionExplorer({ asset: "USDT", network: "TRON" }, hash)).toBe(`https://tronscan.org/#/transaction/${hash}`);
    expect(transactionExplorer({ asset: "BTC", network: "Bitcoin" }, "invalid")).toBeNull();
  });
  it("requires a positive integer confirmation threshold", () => {
    expect(() => validateNetworkPatch({ required_confirmations: "0" })).toThrow();
    expect(() => validateNetworkPatch({ required_confirmations: "1.5" })).toThrow();
    expect(validateNetworkPatch({ required_confirmations: "3" }).required_confirmations).toBe(3);
  });
  it("rejects negative network fees and minimums", () => {
    for (const key of ["min_deposit", "min_withdrawal", "withdrawal_fee"]) expect(() => validateNetworkPatch({ [key]: "-1" })).toThrow();
  });
});