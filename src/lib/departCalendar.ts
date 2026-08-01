// Kalendarz wylotów — czysty TypeScript (testowalny bez React Native).
// Z dni zwróconych przez API (GET /offers/calendar) buduje siatkę miesięcy → tygodni
// (Pon–Nd) → komórek, gdzie każdy dzień pokazuje najtańszą ofertę z wylotem tego dnia.
// Użytkownik wskazuje dzień na kalendarzu i dostaje tanie loty z wylotem właśnie tego dnia.
import type { DepartDayOut, OfferOut } from "../model/types";

export interface DepartCell {
  date: string | null; // YYYY-MM-DD; null = pusta komórka wyrównująca tydzień
  day: number; // numer dnia miesiąca (0 dla pustej)
  price: number | null; // najtańsza oferta z wylotem tego dnia albo null (brak ofert)
  currency: string | null; // waluta ceny tego dnia (do formatowania) albo null
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

// Oferty z wylotem danego dnia (już posortowane po score przez backend). Pusta lista, gdy brak.
export function offersForDate(days: DepartDayOut[], date: string): OfferOut[] {
  return days.find((d) => d.depart_date === date)?.offers ?? [];
}

/**
 * Zbuduj kalendarz wylotów: po jednym miesiącu na każdy miesiąc, w którym są loty.
 * Każdy dzień pokazuje najtańszą ofertę z wylotem tego dnia i liczbę ofert.
 * `today` (YYYY-MM-DD) wyznacza, które dni są „przeszłe" (nie da się już wylecieć).
 */
export function buildDepartCalendar(
  days: DepartDayOut[],
  today: string,
  monthNames: string[] = PL_MONTHS,
): DepartMonth[] {
  const byDate = new Map<string, DepartDayOut>();
  for (const d of days) byDate.set(d.depart_date, d);

  // Najtańszy dzień w całym kalendarzu (globalne minimum ceny).
  let cheapestDate: string | null = null;
  for (const d of days) {
    if (cheapestDate === null || d.cheapest < (byDate.get(cheapestDate)?.cheapest ?? Infinity)) {
      cheapestDate = d.depart_date;
    }
  }

  const monthKeys = [...new Set(days.map((d) => d.depart_date.slice(0, 7)))].sort();
  const months: DepartMonth[] = [];

  for (const key of monthKeys) {
    const [y, m] = key.split("-").map(Number);
    const cells: DepartCell[] = [];

    // wiodące puste komórki, żeby 1. dzień trafił pod właściwy dzień tygodnia
    for (let i = 0; i < mondayIndex(y, m, 1); i++) {
      cells.push({ date: null, day: 0, price: null, currency: null, count: 0, past: false, cheapest: false });
    }
    for (let d = 1; d <= daysInMonth(y, m); d++) {
      const date = iso(y, m, d);
      const info = byDate.get(date);
      cells.push({
        date,
        day: d,
        price: info ? info.cheapest : null,
        currency: info ? info.currency : null,
        count: info ? info.count : 0,
        past: date < today,
        cheapest: date === cheapestDate,
      });
    }
    // domknij ostatni tydzień pustymi komórkami
    while (cells.length % 7 !== 0) {
      cells.push({ date: null, day: 0, price: null, currency: null, count: 0, past: false, cheapest: false });
    }

    const weeks: DepartCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    months.push({ year: y, month: m, label: `${monthNames[m - 1]} ${y}`, weeks });
  }

  return months;
}

export const WEEKDAYS_PL = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
