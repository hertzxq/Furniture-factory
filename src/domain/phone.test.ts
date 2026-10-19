import { describe, expect, it } from "vitest";
import { formatPhone, phoneDigits } from "./phone";

describe("Russian phone input", () => {
  it("accepts pasted national, +7 and domestic 8 formats", () => {
    for (const input of ["9991234567", "+7 (999) 123-45-67", "8 999 123 45 67"])
      expect(phoneDigits(input)).toBe("9991234567");
  });
  it("filters non-digits and limits the national number", () => {
    expect(phoneDigits("abc 999!123456789")).toBe("9991234567");
    expect(phoneDigits("abc")).toBe("");
    expect(phoneDigits("799")).toBe("799");
  });
  it("formats partial input without trailing separators", () => {
    expect(formatPhone("")).toBe("");
    expect(formatPhone("9991")).toBe("999 1");
    expect(formatPhone("9991234567")).toBe("999 123 45 67");
  });
});
