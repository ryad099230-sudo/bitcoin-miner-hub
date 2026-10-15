import { describe, it, expect } from "vitest";
import { calculateIllustrative, referralCommission } from "./money";

describe("illustrative calculator", () => {
  it("$10 at 1% for 1 month", () => expect(calculateIllustrative(10, 0.01, 1)).toEqual({ initial: "10.00", profit: "0.10", total: "10.10" }));
  it("$100 at 1% for 1 month", () => expect(calculateIllustrative(100, 0.01, 1)).toEqual({ initial: "100.00", profit: "1.00", total: "101.00" }));
  it("$100 at 1% for 3 months (simple)", () => expect(calculateIllustrative(100, 0.01, 3)).toEqual({ initial: "100.00", profit: "3.00", total: "103.00" }));
  it("rejects negatives and huge values", () => {
    expect(calculateIllustrative(-1, 0.01, 1)).toBeNull();
    expect(calculateIllustrative(2_000_000, 0.01, 1)).toBeNull();
    expect(calculateIllustrative("abc", 0.01, 1)).toBeNull();
  });
  it("no float drift", () => expect(calculateIllustrative(0.1 + 0.2, 0.01, 12)?.profit).toBe("0.04"));
});

describe("referral commission", () => {
  it("$100 at 1% = $1.00", () => expect(referralCommission(100, 0.01)).toBe("1.00"));
});
