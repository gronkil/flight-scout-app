# Audyt APK — flight-scout / „Lecimy"

Data: 2026-07-30 · Zakres: `.github/workflows/apk.yml`, `app.json`, `eas.json`, `package.json`, `src/config.ts`.
Kontekst: APK budowany Gradle'em na GitHub Actions (bez EAS), publikowany w Releases, instalowany „na wierzch".

## Podsumowanie
Pipeline działa i nadaje się do dystrybucji sideload (MVP). Nie ma błędów blokujących.
Największe ryzyka dotyczą **trwałości podpisu** i **wersjonowania** — do ogarnięcia przed publikacją w Google Play lub szerszą dystrybucją.

## Ustalenia (wg wagi)

### 🔴 A1. Release podpisany kluczem debug (trwałość dystrybucji)
`apk.yml` buduje `assembleRelease`, ale bez własnego keystore — Expo podpisuje release **kluczem debug z szablonu**.
- Konsekwencje:
  - Nie da się opublikować w Google Play w tej formie (Play wymaga własnego klucza upload).
  - Gdy kiedyś przejdziesz na prawdziwy klucz / Play → **niezgodność podpisu**, użytkownicy muszą odinstalować i zainstalować od nowa (utrata danych lokalnych).
  - Brak gwarancji autentyczności — dowolny build z szablonu Expo instaluje się „na wierzch".
- Dla obecnego etapu (sideload, jeden właściciel) — akceptowalne i świadome. **Rekomendacja:** zanim pójdzie do Play/publicznie, wygeneruj stały upload keystore i trzymaj go w GitHub Secrets (to jedyne miejsce, gdzie sekret będzie potrzebny).

### 🟠 A2. `versionName` nigdy nie rośnie
`app.json.expo.version = "0.1.4"` jest stałe; workflow podbija tylko `versionCode` (numer runu).
- Efekt: w telefonie „wersja aplikacji" zawsze pokazuje 0.1.4, mimo kolejnych wydań.
- **Rekomendacja:** ustawiać `versionName` z tagu/daty/run_number obok `versionCode` (jeden krok node w apk.yml).

### 🟠 A3. APK buduje się przy KAŻDYM zielonym pushu na `dev` (koszt)
Nawet zmiany docs/konfiguracji (np. `CLAUDE.md`, `.claude/settings.json`) wyzwalają pełny ~22–23 min build Gradle + nowy Release.
- **Rekomendacja:** filtr ścieżek — budować APK tylko gdy zmienił się kod aplikacji (`src/**`, `App.tsx`, `app.json`, `package.json`, `index.ts`, `assets/**`, `.github/workflows/**`). Dla zmian samych docs → pomijać build (albo osobny, lekki job).

### 🟡 A4. Rozjazd źródeł wersji
`package.json` = `0.1.0`, `app.json` = `0.1.4`. Do tego `eas.json` ma `appVersionSource: "remote"` + `autoIncrement`, które są **martwe** (EAS nie jest używany).
- **Rekomendacja:** jedno źródło prawdy wersji (proponuję `app.json`), a `package.json` zsynchronizować lub jawnie oznaczyć jako nieistotny dla wydania.

### 🟡 A5. `eas.json` szczątkowy / mylący
`production` = `app-bundle`, ale cały pipeline świadomie omija EAS.
- **Rekomendacja:** zostawić z komentarzem „nieużywane — build przez Actions" albo usunąć, żeby nie sugerować drugiej ścieżki wydania.

### 🟢 A6. Brak treści wydania (changelog)
Body Release jest stałym tekstem — nie widać co się zmieniło.
- **Rekomendacja:** wrzucać do body listę commitów od poprzedniego tagu (`git log`).

### 🟢 A7. Fallback sieci na cleartext localhost
`src/config.ts`: `DEFAULT_API_BASE_URL = "http://localhost:8000"`. W buildzie `app.json.extra.apiBaseUrl` jest ustawione na HTTPS (Render), więc OK. Ale gdyby kiedyś było puste → fallback na `http://` (Android 9+ blokuje cleartext, ciche błędy).
- **Rekomendacja:** w buildzie produkcyjnym twardo wymagać skonfigurowanego HTTPS (walidacja w CI albo brak fallbacku w release).

### ℹ️ A8. Logowanie Google nieaktywne — świadome
`app.json.extra.google.*` puste → przycisk Google nieaktywny; logowanie e-mailem działa bez konfiguracji (`src/config.ts` obsługuje to elegancko). To konfiguracja, nie błąd.

### 🟢 A9. Narastające Release'y
Każdy run tworzy nowy tag `apk-v{N}`. Z czasem uzbiera się dużo wydań.
- **Rekomendacja:** okresowe czyszczenie starych releasów albo trzymanie tylko N ostatnich.

## Co jest OK
- Build deterministyczny: `npm ci` → `expo prebuild` → `./gradlew assembleRelease --no-daemon`.
- `versionCode` rośnie (aktualizacje instalują się na wierzch).
- Brak sekretów w repo; API po HTTPS.
- Cache npm + Gradle skonfigurowany.

## Priorytet działań
1. (przed Play/publicznie) A1 — stały keystore w Secrets.
2. (szybkie) A3 — filtr ścieżek, żeby nie budować APK dla zmian docs.
3. (szybkie) A2 + A4 — spójne wersjonowanie (`versionName` + jedno źródło).
4. (kosmetyka) A5, A6, A9.
