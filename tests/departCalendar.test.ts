import { describe, expect, it } from "vitest";

import { buildDepartCalendar, offersForDate, type DepartCell } from "../src/lib/departCalendar";
import type { OfferOut } from "../src/model/types";

function offer(dest: string, depart: string | null, price: number): OfferOut {
  return {
    city: dest,
    dest,
    origin: "WAW",
    price,
    currency: "PLN",
    trip_type: "one-way",
    depart_date: depart,
    return_date: null,
    changes: 0,
    grade: "B",
    score: price,
    link: `L-${dest}-${depart}`,
    ret: null,
    flex: null,
  };
}

function cellOf(months: ReturnType<typeof buildDepartCalendar>, date: string): DepartCell | undefined {
  for (const m of months) {
    for (const w of m.weeks) {
      for (const c of w) if (c.date === date) return c;
    }
  }
  return undefined;
}

describe("buildDepartCalendar", () => {
  const offers = [
    offer("BCN", "2026-09-12", 320),
    offer("BCN", "2026-09-12", 280), // tańszy tego samego dnia
    offer("ROM", "2026-09-22", 410),
    offer("LIS", "2026-10-02", 210),
    offer("XXX", null, 99), // oferta bez daty wylotu — pomijana
  ];
  const months = buildDepartCalendar(offers, "2026-09-10");

  it("tworzy po miesiącu na każdy miesiąc z lotami", () => {
    expect(months.map((m) => m.label)).toEqual(["Wrzesień 2026", "Październik 2026"]);
  });

  it("każdy tydzień ma dokładnie 7 komórek (Pon–Nd)", () => {
    for (const m of months) for (const w of m.weeks) expect(w).toHaveLength(7);
  });

  it("dzień pokazuje najtańszą ofertę i liczbę ofert", () => {
    const c = cellOf(months, "2026-09-12");
    expect(c?.price).toBe(280); // najtańsza z dwóch tego dnia
    expect(c?.count).toBe(2);
    expect(c?.past).toBe(false);
  });

  it("dni przed dzisiejszym są oznaczone jako przeszłe", () => {
    const before = cellOf(months, "2026-09-09");
    expect(before?.past).toBe(true);
    const today = cellOf(months, "2026-09-10");
    expect(today?.past).toBe(false); // sam dzień dzisiejszy nie jest przeszły
  });

  it("wyróżnia najtańszy dzień w całym kalendarzu", () => {
    expect(cellOf(months, "2026-10-02")?.cheapest).toBe(true); // 210 = globalne minimum
    expect(cellOf(months, "2026-09-12")?.cheapest).toBe(false);
  });

  it("dzień bez lotów ma null ceny i zero ofert", () => {
    const gap = cellOf(months, "2026-09-15");
    expect(gap?.price).toBeNull();
    expect(gap?.count).toBe(0);
  });

  it("pomija oferty bez daty wylotu (nie tworzy z nich miesięcy)", () => {
    // Gdyby oferta bez daty trafiła do kalendarza, byłby dodatkowy/pusty miesiąc.
    expect(months).toHaveLength(2);
  });

  it("pusta lista → brak miesięcy", () => {
    expect(buildDepartCalendar([], "2026-09-10")).toEqual([]);
  });
});

describe("offersForDate", () => {
  const offers = [
    offer("BCN", "2026-09-12", 320),
    offer("ROM", "2026-09-12", 180),
    offer("LIS", "2026-09-13", 210),
  ];

  it("zwraca oferty danego dnia posortowane od najtańszej", () => {
    const list = offersForDate(offers, "2026-09-12");
    expect(list.map((o) => o.price)).toEqual([180, 320]);
    expect(list.map((o) => o.dest)).toEqual(["ROM", "BCN"]);
  });

  it("dzień bez ofert → pusta lista", () => {
    expect(offersForDate(offers, "2026-09-20")).toEqual([]);
  });
});
