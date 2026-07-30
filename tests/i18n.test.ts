import { describe, expect, it } from "vitest";

import {
  changesLabel,
  LANGS,
  messages,
  pluralNights,
  tripLabel,
} from "../src/i18n/messages";

// Porównanie kształtu (zbiór ścieżek kluczy) dwóch obiektów — pilnuje, żeby PL i EN
// miały DOKŁADNIE te same klucze (brak zapomnianego tłumaczenia).
function keyPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    keyPaths(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("messages", () => {
  it("PL i EN mają identyczny zestaw kluczy", () => {
    const pl = keyPaths(messages.pl).sort();
    const en = keyPaths(messages.en).sort();
    expect(en).toEqual(pl);
  });

  it("każdy język ma 7 dni i 12 miesięcy", () => {
    for (const l of LANGS) {
      expect(messages[l].cal.weekdays).toHaveLength(7);
      expect(messages[l].cal.months).toHaveLength(12);
    }
  });
});

describe("pluralNights", () => {
  it("polska odmiana", () => {
    expect(pluralNights(1, "pl")).toBe("1 noc");
    expect(pluralNights(2, "pl")).toBe("2 noce");
    expect(pluralNights(5, "pl")).toBe("5 nocy");
    expect(pluralNights(22, "pl")).toBe("22 noce");
    expect(pluralNights(null, "pl")).toBe("1–7 nocy");
  });
  it("angielska odmiana", () => {
    expect(pluralNights(1, "en")).toBe("1 night");
    expect(pluralNights(3, "en")).toBe("3 nights");
    expect(pluralNights(null, "en")).toBe("1–7 nights");
  });
});

describe("tripLabel", () => {
  it("obie strony / w jedną", () => {
    expect(tripLabel("round-trip", "pl")).toBe("w obie strony");
    expect(tripLabel("round-trip", "en")).toBe("round trip");
    expect(tripLabel("one-way", "pl")).toBe("w jedną stronę");
    expect(tripLabel("one-way", "en")).toBe("one way");
  });
});

describe("changesLabel", () => {
  it("bezpośredni / przesiadki / nieznane", () => {
    expect(changesLabel(0, "pl")).toBe("bezpośredni");
    expect(changesLabel(0, "en")).toBe("direct");
    expect(changesLabel(null, "pl")).toBe("");
    expect(changesLabel(1, "pl")).toBe("1 przes.");
    expect(changesLabel(1, "en")).toBe("1 stop");
    expect(changesLabel(2, "en")).toBe("2 stops");
  });
});
