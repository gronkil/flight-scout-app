---
name: apk-audit
description: Audytuj konfigurację buildu i wydania APK w repo flight-scout (podpis, wersjonowanie, bezpieczeństwo, efektywność, treść wydania). Użyj, gdy ktoś prosi o "audyt APK", przegląd buildu Androida, sprawdzenie podpisu/wersji, albo po zmianach w apk.yml / app.json / eas.json. Wynik zapisz/aktualizuj w docs/apk-audit.md.
---

# apk-audit — audyt buildu i wydania APK

Cel: ocenić `.github/workflows/apk.yml` + `app.json` + `eas.json` + `package.json` + `src/config.ts` i utrzymać aktualny raport w `docs/apk-audit.md`.

## Checklista (przejdź każdy punkt)

1. **Podpis (signing).** Czy release ma stały upload keystore (Secrets), czy nadal klucz debug z szablonu Expo? Debug = OK tylko dla sideload; przed Play → własny klucz. Zgłoś ryzyko niezgodności podpisu przy przyszłej migracji.
2. **Wersjonowanie.** Czy `versionCode` rośnie (aktualizacje na wierzch)? Czy `versionName` też się zmienia? Czy `package.json` vs `app.json` są spójne? Czy `eas.json` (appVersionSource/autoIncrement) nie wprowadza martwej, mylącej konfiguracji?
3. **Wyzwalanie buildu.** Czy APK buduje się przy każdym zielonym pushu (też docs)? Rekomenduj filtr ścieżek (`src/**`, `App.tsx`, `app.json`, `package.json`, `index.ts`, `assets/**`, `.github/workflows/**`).
4. **Sieć/bezpieczeństwo.** `app.json.extra.apiBaseUrl` po HTTPS? Fallback w `src/config.ts` (cleartext localhost) nieaktywny w release? Brak sekretów w repo?
5. **Treść wydania.** Body Release ma changelog (log commitów od poprzedniego tagu) czy stały tekst?
6. **Higiena.** Cache npm+Gradle? `--no-daemon`? Narastające tagi `apk-v{N}` — potrzeba czyszczenia?
7. **Funkcje opcjonalne.** Puste id (np. Google) obsłużone łagodnie? (to konfiguracja, nie błąd).

## Wynik
- Zaktualizuj `docs/apk-audit.md`: ustalenia z wagą (🔴/🟠/🟡/🟢/ℹ️), sekcja „Co jest OK", priorytet działań.
- W czacie podaj skrót: 3–5 najważniejszych ryzyk + rekomendowane następne kroki. Nie zmieniaj `apk.yml` bez wyraźnej zgody użytkownika — audyt tylko raportuje, chyba że poproszono o wdrożenie poprawek.
