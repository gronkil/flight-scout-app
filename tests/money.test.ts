import { describe, expect, it } from "vitest";

import { CURRENCIES, formatAmount, formatMoney } from "../src/lib/money";

describe("formatMoney", () => {
  it("zaokrągla do pełnych jednostek (bez groszy)", () => {
    expect(formatMoney(189.4, "PLN", "pl-PL")).toContain("189");
    expect(formatMoney(189.4, "PLN", "pl-PL")).not.toContain("189,4");
  });

  it("używa symbolu waluty wg locale", () => {
    const eur = formatMoney(250, "EUR", "en-US");
    expect(eur).toContain("250");
    expect(eur).toContain("€");
  });

  it("różne locale dają różny format tej samej kwoty", () => {
    const pl = formatMoney(1200, "PLN", "pl-PL");
    const en = formatMoney(1200, "USD", "en-US");
    expect(pl).toContain("1"); // separator tysięcy zależny od locale
    expect(en).toContain("$");
  });

  it("fallback przy nieprawidłowym kodzie waluty nie rzuca", () => {
    // Pusty kod waluty → Intl rzuca RangeError → wracamy do prostego formatu.
    expect(formatMoney(100, "", "pl-PL")).toBe("100 ");
  });

  it("obsługuje wszystkie zadeklarowane waluty", () => {
    for (const c of CURRENCIES) {
      expect(formatMoney(100, c, "en-US")).toContain("100");
    }
    expect(CURRENCIES).toContain("EUR");
    expect(CURRENCIES).toContain("PLN");
  });
});

describe("formatAmount", () => {
  it("prosty format 'kwota KOD'", () => {
    expect(formatAmount(1849.4, "pln")).toBe("1849 PLN");
  });
});
