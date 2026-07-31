// Kalendarz wylotów — czysty TypeScript (testowalny bez React Native).
// Z listy ofert (OfferOut) buduje siatkę miesięcy → tygodni (Pon–Nd) → komórek,
// gdzie każdy dzień pokazuje najtańszą ofertę z wylotem tego dnia. Użytkownik wskazuje
// dzień na kalendarzu i dostaje tanie loty z wylotem właśnie tego dnia.
import type { OfferOut } from "../model/types";

export interface DepartCell {
  date: string | null; // YYYY-MM-DD; null = pusta komórka wyrównująca tydzień
  day: number; // numer dnia miesiąca (0 dla pustej)
  price: number | null; // najtańsza oferta z wylotem tego dnia albo null (brak ofert)
  count: number; // ile ofert ma wylot tego dnia
  past: boolean; // dzień w przeszłości (nie da się już wylecieć)
  cheapest: boolean; // najtańszy dzień w całym kalendarzu
}

export interface DepartMonth {
  year: number;
  month: number; // 1–12
  label: string; // np. "Wrzesień 2026"
  weeks: DepartCell[][]; // wiersze po 7 komórek, tydzień Pon–Nd
}

const PL_MONTHS = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Poniedziałek = 0 … Niedziela = 6 (getUTCDay daje Nd=0, więc przesuwamy).
function mondayIndex(y: number, m: number, d: number): number {
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

// Oferty z wylotem danego dnia, posortowane od najtańszej (stabilnie po cenie).
export function offersForDate(offers: OfferOut[], date: string): OfferOut[] {
  return offers.filter((o) => o.depart_date === date).sort((a, b) => a.price - b.price);
}

/**
 * Zbuduj kalendarz wylotów: po jednym miesiącu na każdy miesiąc, w którym są loty.
 * Każdy dzień pokazuje najtańszą ofertę z wylotem tego dnia i liczbę ofert.
 * `today` (YYYY-MM-DD) wyznacza, które dni są „przeszłe" (nie da się już wylecieć).
 */
export function buildDepartCalendar(
  offers: OfferOut[],
  today: string,
  monthNames: string[] = PL_MONTHS,
): DepartMonth[] {
  // Najtańsza cena i liczba ofert dla każdej daty wylotu (pomijamy oferty bez daty).
  const cheapestByDate = new Map<string, number>();
  const countByDate = new Map<string, number>();
  for (const o of offers) {
    const date = o.depart_date;
    if (!date) continue;
    const prev = cheapestByDate.get(date);
    if (prev === undefined || o.price < prev) cheapestByDate.set(date, o.price);
    countByDate.set(date, (countByDate.get(date) ?? 0) + 1);
  }

  // Najtańszy dzień w całym kalendarzu (globalne minimum ceny).
  let cheapestDate: string | null = null;
  for (const [date, price] of cheapestByDate) {
    if (cheapestDate === null || price < (cheapestByDate.get(cheapestDate) as number)) {
      cheapestDate = date;
    }
  }

  const monthKeys = [...new Set([...cheapestByDate.keys()].map((d) => d.slice(0, 7)))].sort();
  const months: DepartMonth[] = [];

  for (const key of monthKeys) {
    const [y, m] = key.split("-").map(Number);
    const cells: DepartCell[] = [];

    // wiodące puste komórki, żeby 1. dzień trafił pod właściwy dzień tygodnia
    for (let i = 0; i < mondayIndex(y, m, 1); i++) {
      cells.push({ date: null, day: 0, price: null, count: 0, past: false, cheapest: false });
    }
    for (let d = 1; d <= daysInMonth(y, m); d++) {
      const date = iso(y, m, d);
      const price = cheapestByDate.get(date);
      cells.push({
        date,
        day: d,
        price: price ?? null,
        count: countByDate.get(date) ?? 0,
        past: date < today,
        cheapest: date === cheapestDate,
      });
    }
    // domknij ostatni tydzień pustymi komórkami
    while (cells.length % 7 !== 0) {
      cells.push({ date: null, day: 0, price: null, count: 0, past: false, cheapest: false });
    }

    const weeks: DepartCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    months.push({ year: y, month: m, label: `${monthNames[m - 1]} ${y}`, weeks });
  }

  return months;
}

export const WEEKDAYS_PL = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
