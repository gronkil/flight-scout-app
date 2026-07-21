// Konfiguracja klienta. Bez sekretów w kodzie — baseUrl konfigurowalny, token z logowania.
import Constants from "expo-constants";

export const DEFAULT_API_BASE_URL = "http://localhost:8000";

// Domyślny użytkownik (backend jednoosobowy w M4/M5) — MUSI zgadzać się z workerem
// (config.settings.DEFAULT_USER_ID, domyślnie "owner"), żeby push trafił do właściwych urządzeń.
export const DEFAULT_USER_ID = "owner";

// Adres API z app.json → extra.apiBaseUrl (ustawiasz raz przed buildem; to konfiguracja, nie kod).
export function configuredBaseUrl(): string {
  const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };
  return resolveBaseUrl(extra.apiBaseUrl);
}

// W produkcji nadpisz przez ekran ustawień lub app.json extra.apiBaseUrl.
export function resolveBaseUrl(override?: string | null): string {
  return (override && override.trim()) || DEFAULT_API_BASE_URL;
}
