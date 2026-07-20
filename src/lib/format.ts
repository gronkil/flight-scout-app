// Formatery prezentacji — czysty TypeScript (testowalny bez RN).
import type { Grade, OfferOut } from "../model/types";

export function formatPrice(amount: number, currency: string): string {
  return `${Math.round(amount)} ${currency.toUpperCase()}`;
}

// Polska odmiana liczby nocy: 1 noc / 2 noce / 5 nocy.
export function pluralNights(n: number | null): string {
  if (n === null) return "1–7 nocy";
  if (n === 1) return "1 noc";
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} noce`;
  return `${n} nocy`;
}

// Kolor odznaki oceny (spójny z mailem/backendem).
export function gradeColor(grade: Grade | null): string {
  switch (grade) {
    case "A":
      return "#15803d";
    case "B":
      return "#4d7c0f";
    case "C":
      return "#b45309";
    case "D":
      return "#b91c1c";
    default:
      return "#475569";
  }
}

export function tripLabel(trip: string): string {
  return trip === "round-trip" ? "w obie strony" : "w jedną stronę";
}

export function offerDates(o: Pick<OfferOut, "depart_date" | "return_date">): string {
  const dep = o.depart_date ?? "?";
  return o.return_date ? `${dep} – ${o.return_date}` : dep;
}

// Bieżący miesiąc w formacie YYYY-MM (do wyszukiwania).
export function currentMonth(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
