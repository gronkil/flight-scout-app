import { describe, expect, it } from "vitest";

import { buildReturnCalendar, type CalCell } from "../src/lib/returnCalendar";
import type { ReturnDayOut } from "../src/model/types";

function day(date: string, price: number): ReturnDayOut {
  return { return_date: date, price, nights: null, changes: 0, link: `L-${date}` };
}

function cellOf(months: ReturnType<typeof buildReturnCalendar>, date: string): CalCell | undefined {
  for (const m of months) {
    for (const w of m.weeks) {
      for (const c of w) if (c.date === date) return c;
    }
  }
  return undefined;
}

describe("buildReturnCalendar", () => {
  const days = [day("2026-09-12", 870), day("2026-09-22", 845), day("2026-10-02", 760)];
  const months = buildReturnCalendar(days, "2026-09-12");

  it("tworzy po miesiącu na każdy miesiąc z powrotami", () => {
    expect(months.map((m) => m.label)).toEqual(["Wrzesień 2026", "Październik 2026"]);
  });

  it("każdy tydzień ma dokładnie 7 komórek (Pon–Nd)", () => {
    for (const m of months) for (const w of m.weeks) expect(w).toHaveLength(7);
  });

  it("mapuje cenę i link na właściwy dzień", () => {
    const c = cellOf(months, "2026-09-22");
    expect(c?.price).toBe(845);
    expect(c?.link).toBe("L-2026-09-22");
    expect(c?.past).toBe(false);
  });

  it("dni przed wylotem są oznaczone jako przeszłe, bez ceny", () => {
    const before = cellOf(months, "2026-09-11");
    expect(before?.past).toBe(true);
    expect(before?.price).toBeNull();
    const departDay = cellOf(months, "2026-09-12");
    expect(departDay?.past).toBe(false); // sam dzień wylotu nie jest przeszły
  });

  it("wyróżnia najtańszy dzień w całym kalendarzu", () => {
    expect(cellOf(months, "2026-10-02")?.cheapest).toBe(true);
    expect(cellOf(months, "2026-09-22")?.cheapest).toBe(false);
  });

  it("dzień bez powrotu ma null ceny i linku", () => {
    const gap = cellOf(months, "2026-09-15");
    expect(gap?.price).toBeNull();
    expect(gap?.link).toBeNull();
  });

  it("pusta lista → brak miesięcy", () => {
    expect(buildReturnCalendar([], "2026-09-12")).toEqual([]);
  });
});
