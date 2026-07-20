// Konfiguracja klienta. Bez sekretów w kodzie — baseUrl konfigurowalny, token z logowania.
export const DEFAULT_API_BASE_URL = "http://localhost:8000";

// W produkcji nadpisz przez ekran ustawień lub zmienną budowania (app.json extra.apiBaseUrl).
export function resolveBaseUrl(override?: string | null): string {
  return (override && override.trim()) || DEFAULT_API_BASE_URL;
}
