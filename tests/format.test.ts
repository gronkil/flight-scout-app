import { describe, expect, it } from "vitest";

import {
  currentMonth,
  formatPrice,
  gradeColor,
  offerDates,
  pluralNights,
  tripLabel,
} from "../src/lib/format";

describe("format", () => {
  it("formatPrice zaokrągla i wielkie litery waluty", () => {
    expect(formatPrice(1849.4, "pln")).toBe("1849 PLN");
  });

  it("pluralNights — polska odmiana", () => {
    expect(pluralNights(1)).toBe("1 noc");
    expect(pluralNights(3)).toBe("3 noce");
    expect(pluralNights(5)).toBe("5 nocy");
    expect(pluralNights(12)).toBe("12 nocy");
    expect(pluralNights(22)).toBe("22 noce");
    expect(pluralNights(null)).toBe("1–7 nocy");
  });

  it("gradeColor mapuje oceny", () => {
    expect(gradeColor("A")).toBe("#15803d");
    expect(gradeColor(null)).toBe("#475569");
  });

  it("tripLabel", () => {
    expect(tripLabel("round-trip")).toBe("w obie strony");
    expect(tripLabel("one-way")).toBe("w jedną stronę");
  });

  it("offerDates — one-way vs round", () => {
    expect(offerDates({ depart_date: "2026-09-10", return_date: null })).toBe("2026-09-10");
    expect(offerDates({ depart_date: "2026-09-10", return_date: "2026-09-24" })).toBe(
      "2026-09-10 – 2026-09-24",
    );
  });

  it("currentMonth formatuje YYYY-MM (UTC)", () => {
    expect(currentMonth(new Date("2026-09-15T12:00:00Z"))).toBe("2026-09");
  });
});
