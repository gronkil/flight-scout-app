// Budowa siatki kalendarza powrotów — czysty TypeScript (testowalny bez React Native).
// Z płaskiej listy dni (ReturnDayOut) tworzy miesiące → tygodnie (Pon–Nd) → komórki.
import type { ReturnDayOut } from "../model/types";

export interface CalCell {
  date: string | null; // YYYY-MM-DD; null = pusta komórka wyrównująca tydzień
  day: number; // numer dnia miesiąca (0 dla pustej)
  price: number | null; // najtańszy powrót tego dnia albo null (brak danych)
  link: string | null; // deeplink round-trip (z markerem) albo null
  past: boolean; // dzień przed wylotem (nie da się wrócić wcześniej)
  cheapest: boolean; // najtańszy dzień w całym kalendarzu
}

export interface CalMonth {
  year: number;
  month: number; // 1–12
  label: string; // np. "Wrzesień 2026"
  weeks: CalCell[][]; // wiersze po 7 komórek, tydzień Pon–Nd
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

/**
 * Zbuduj kalendarz powrotów: po jednym miesiącu na każdy miesiąc, w którym są powroty.
 * `departDate` (YYYY-MM-DD) wyznacza, które dni są „przeszłe" (przed wylotem — nieaktywne).
 */
export function buildReturnCalendar(days: ReturnDayOut[], departDate: string): CalMonth[] {
  const byDate = new Map<string, ReturnDayOut>();
  for (const d of days) byDate.set(d.return_date, d);

  let cheapestDate: string | null = null;
  for (const d of days) {
    if (cheapestDate === null || d.price < (byDate.get(cheapestDate)?.price ?? Infinity)) {
      cheapestDate = d.return_date;
    }
  }

  const monthKeys = [...new Set(days.map((d) => d.return_date.slice(0, 7)))].sort();
  const months: CalMonth[] = [];

  for (const key of monthKeys) {
    const [y, m] = key.split("-").map(Number);
    const cells: CalCell[] = [];

    // wiodące puste komórki, żeby 1. dzień trafił pod właściwy dzień tygodnia
    for (let i = 0; i < mondayIndex(y, m, 1); i++) {
      cells.push({ date: null, day: 0, price: null, link: null, past: false, cheapest: false });
    }
    for (let d = 1; d <= daysInMonth(y, m); d++) {
      const date = iso(y, m, d);
      const info = byDate.get(date);
      cells.push({
        date,
        day: d,
        price: info ? info.price : null,
        link: info ? info.link : null,
        past: date < departDate,
        cheapest: date === cheapestDate,
      });
    }
    // domknij ostatni tydzień pustymi komórkami
    while (cells.length % 7 !== 0) {
      cells.push({ date: null, day: 0, price: null, link: null, past: false, cheapest: false });
    }

    const weeks: CalCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    months.push({ year: y, month: m, label: `${PL_MONTHS[m - 1]} ${y}`, weeks });
  }

  return months;
}

export const WEEKDAYS_PL = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
