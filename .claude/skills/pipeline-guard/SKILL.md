---
name: pipeline-guard
description: Pilnuj pipeline'u dev→CI→main→APK w repo flight-scout. Użyj, gdy trzeba sprawdzić stan CI/Release, zareagować na czerwony build (zdiagnozować z logów i naprawić na dev), potwierdzić awans main i publikację APK, albo poprowadzić cykliczny nadzór (pętla/Routine). Wyzwalacze: "sprawdź pipeline", "czy build zielony", "pilnuj CI", "napraw build", "co z APK".
---

# pipeline-guard — nadzór nad pipeline'em flight-scout

Repo `gronkil/flight-scout-app`. Przepływ: **push na `dev` → CI (Expo/RN) → (zielone) → awans `main` (ff) → build APK (Gradle) → GitHub Release `apk-v{N}`**.
Definicje: `.github/workflows/ci.yml`, `.github/workflows/apk.yml`. Reguła twarda: **pracuj na `dev`, NIGDY nie pushuj ręcznie na `main`** (main jest chroniona `deny` w `.claude/settings.json`).

## Procedura orkiestracji (wykonuj po kolei)

1. **Zbierz stan** — deleguj do subagenta `ci-monitor` (albo zrób sam):
   - ostatni run `ci.yml` na `dev` (status, conclusion, head_sha),
   - ostatni run `apk.yml` ("Release (dev -> main + APK)") — status/conclusion,
   - czy `main` == zielony commit z `dev`, czy jest świeży Release z plikiem `flight-scout.apk`.
   Narzędzia: `mcp__github__actions_list`, `mcp__github__get_commit`, `mcp__github__list_releases`.

2. **Zdecyduj wg stanu:**
   - **CI/Release in_progress|queued** → oszacuj pozostały czas (`run_started_at` + typowo ~22–23 min dla APK) i **przełóż sprawdzenie** (`send_later`). Interwał: ~2 min gdy blisko końca, ~4–5 min gdy dalej. Nie kończ pętli.
   - **success** → potwierdź awans `main` i Release, podsumuj i **zakończ** (nie przekładaj dalej).
   - **failure/timed_out/cancelled** → deleguj do subagenta `build-doctor`: pobrać logi (`get_job_logs` failed_only), naprawić na `dev`, `npm run typecheck` + `npm run test` lokalnie, commit + `git push origin dev` (to wyzwoli pipeline). Potem przełóż sprawdzenie na ~2 min.

3. **Okresowy audyt jakości APK** (raz na dobę lub przy zmianach w `apk.yml`/`app.json`/`eas.json`) → deleguj do `apk-auditor`; aktualizuj `docs/apk-audit.md`, jeśli coś się zmieniło.

4. **Raportuj zwięźle.** Godziny **w czasie polskim** (Europe/Warsaw, latem UTC+2). Nie narracja krok-po-kroku — stan + decyzja + następny termin.

## Zasady
- Wszystkie fixy i pushe idą na `dev`. `main` tylko przez automatykę.
- Nie polegaj wyłącznie na powiadomieniach — pętla sama się przekłada aż do stanu terminalnego (green albo naprawiony i ponowiony).
- Jeśli ten sam build pada 2× z tego samego powodu mimo poprawki — zatrzymaj auto-fix i zapytaj użytkownika (`AskUserQuestion`).
