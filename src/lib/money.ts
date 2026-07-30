// Formatowanie kwot zależne od locale. Czysty TS (testowalny bez RN).
// UWAGA: NIE przeliczamy walut w kliencie — kwota i kod waluty pochodzą z API
// (backend wycenia po swoim kursie). Tu tylko ładnie wyświetlamy to, co przyszło.

export type Currency = "PLN" | "EUR" | "USD" | "GBP";

export const CURRENCIES: Currency[] = ["PLN", "EUR", "USD", "GBP"];

// Zaokrąglamy do pełnych jednostek (ceny lotów podajemy bez groszy).
export function formatMoney(amount: number, currency: string, locale: string): string {
  const rounded = Math.round(amount);
  const code = currency.toUpperCase();
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(rounded);
  } catch {
    // Hermes bez pełnego ICU / nieznany kod waluty → prosty fallback „1849 PLN".
    return `${rounded} ${code}`;
  }
}

// Sama różnica/oszczędność (bez symbolu w środku zdania bywa czytelniejsza) — zostaje
// wariant z kodem, spójny z fallbackiem.
export function formatAmount(amount: number, currency: string): string {
  return `${Math.round(amount)} ${currency.toUpperCase()}`;
}
