// Pure logika feedu — sort/filtr po stronie klienta (defensywnie; API i tak filtruje).
import type { Grade, OfferOut } from "../model/types";

const RANK: Record<Grade, number> = { A: 0, B: 1, C: 2, D: 3 };

export function sortOffersByScore(offers: OfferOut[]): OfferOut[] {
  return [...offers].sort((a, b) => a.score - b.score);
}

export function onlyGrades(offers: OfferOut[], allowed: Grade[]): OfferOut[] {
  const set = new Set(allowed);
  return offers.filter((o) => o.grade !== null && set.has(o.grade));
}

export function bestGrade(offers: OfferOut[]): Grade | null {
  let best: Grade | null = null;
  for (const o of offers) {
    if (o.grade === null) continue;
    if (best === null || RANK[o.grade] < RANK[best]) best = o.grade;
  }
  return best;
}
