import { describe, expect, it } from "vitest";

import { bestGrade, onlyGrades, sortOffersByScore } from "../src/lib/feed";
import type { OfferOut } from "../src/model/types";

function offer(dest: string, score: number, grade: OfferOut["grade"]): OfferOut {
  return {
    city: dest,
    dest,
    origin: "WAW",
    price: 100,
    currency: "PLN",
    trip_type: "one-way",
    depart_date: "2026-09-10",
    return_date: null,
    changes: 0,
    grade,
    score,
    link: null,
    ret: null,
    flex: null,
  };
}

describe("feed", () => {
  it("sortuje rosnąco po score (0 = najlepsza)", () => {
    const sorted = sortOffersByScore([offer("A", 0.5, "C"), offer("B", 0.1, "A")]);
    expect(sorted.map((o) => o.dest)).toEqual(["B", "A"]);
  });

  it("filtruje po ocenach", () => {
    const kept = onlyGrades([offer("A", 0.1, "A"), offer("B", 0.5, "C"), offer("C", 0.3, null)], [
      "A",
      "B",
    ]);
    expect(kept.map((o) => o.dest)).toEqual(["A"]);
  });

  it("bestGrade zwraca najlepszą", () => {
    expect(bestGrade([offer("A", 0.3, "B"), offer("B", 0.1, "A")])).toBe("A");
    expect(bestGrade([offer("A", 0.9, null)])).toBeNull();
  });
});
