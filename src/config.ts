// Konfiguracja klienta. Bez sekretów w kodzie — baseUrl konfigurowalny, token z logowania.
import Constants from "expo-constants";
import { Platform } from "react-native";

// Adres API używany, gdy konfiguracja z app.json (extra.apiBaseUrl) nie jest dostępna.
// WAŻNE (web): w statycznym eksporcie web `Constants.expoConfig` bywa pusty i wtedy apka
// wpada w ten fallback. Dlatego musi to być PRODUKCYJNY backend, a nie `localhost` —
// inaczej wersja webowa (GitHub Pages) próbuje dzwonić pod localhost telefonu i dostaje
// „Brak połączenia z serwerem". Lokalny dev z backendem na localhost ustawia adres ręcznie
// (ekran logowania → „Zaawansowane") albo przez app.json extra.apiBaseUrl.
export const DEFAULT_API_BASE_URL = "https://flight-scout-api.onrender.com";

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
  const url = (override && override.trim()) || DEFAULT_API_BASE_URL;
  // Twardy guard: wersja WEB NIGDY nie może bić w loopback telefonu użytkownika. Gdyby
  // konfiguracja (stary cache, pomyłka) wskazywała localhost/127.0.0.1 — wymuś produkcyjny
  // backend. Natywny dev pod localhost nietknięty (guard tylko dla Platform.OS === "web").
  if (Platform.OS === "web" && /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(url)) {
    return DEFAULT_API_BASE_URL;
  }
  return url;
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
