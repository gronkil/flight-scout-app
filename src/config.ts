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

// Identyfikatory klienta Google (opcjonalne). Ustawiasz raz w app.json → extra.google
// (androidClientId / webClientId) po założeniu projektu w Google Cloud. Puste = przycisk
// Google nieaktywny (logowanie e-mailem działa bez żadnej konfiguracji). To konfiguracja, nie kod.
export interface GoogleClientConfig {
  androidClientId?: string;
  webClientId?: string;
}

export function googleConfig(): GoogleClientConfig {
  const extra = (Constants.expoConfig?.extra ?? {}) as { google?: GoogleClientConfig };
  const g = extra.google ?? {};
  // Puste stringi z app.json traktujemy jak brak (hook Google nie dostaje pustego id).
  return {
    androidClientId: g.androidClientId?.trim() || undefined,
    webClientId: g.webClientId?.trim() || undefined,
  };
}

export function isGoogleConfigured(): boolean {
  const g = googleConfig();
  return Boolean(g.androidClientId || g.webClientId);
}
