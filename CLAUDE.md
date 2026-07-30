# flight-scout — przewodnik dla agentów Claude

Aplikacja mobilna **flight-scout / „Lecimy"** (Expo / React Native, TypeScript).
Rozmawia wyłącznie z naszym API.

## ⛔ NAJWAŻNIEJSZA REGUŁA: gałęzie i wydania

**Pracujemy na gałęzi `dev`. NIGDY nie commituj ani nie pushuj bezpośrednio na `main`.**

`main` jest aktualizowana **wyłącznie automatycznie** przez pipeline CI po zielonych
testach. Bezpośredni push na `main` psuje ten mechanizm i jest zabroniony.

### Jak interpretować prośby użytkownika

Gdy użytkownik mówi jedną z tych rzeczy (lub podobnie):

- „wypchnij / wyślij zmiany do main"
- „wypuść to", „zrób wydanie", „zbuduj APK", „dawaj na produkcję"
- „scal do main", „merge do main"

**to znaczy: scommituj zmiany na `dev` i wypchnij `dev`.** NIE pushuj na `main`
własnoręcznie. Awans do `main` i build APK zrobi się sam, o ile CI przejdzie.

Jeśli użytkownik wprost każe pushnąć na `main` mimo tej reguły — dopytaj, bo to
obejście automatyki; domyślnie zawsze celuj w `dev`.

## Pipeline (jak to działa)

```
push na dev
   └─ CI (Expo/RN):  npm ci → typecheck (tsc strict) → testy (Vitest) → bundle (expo export)
        ├─ 🔴 czerwone → STOP. main nietknięta, brak APK. Napraw na dev i pushnij ponownie.
        └─ 🟢 zielone  → workflow „Release (dev -> main + APK)":
              1) fast-forward main do tego samego (zielonego) commita
              2) expo prebuild + ./gradlew assembleRelease
              3) GitHub Release  apk-v{N}  z plikiem flight-scout.apk
```

- Awans robiony `git merge --ff-only` — jeśli `main` rozjechała się z `dev`,
  pipeline **celowo przerwie** zamiast nadpisać historię (bezpieczna awaria).
- Cały mechanizm działa bez żadnych sekretów (wbudowany `GITHUB_TOKEN`).
- Definicje: `.github/workflows/ci.yml` oraz `.github/workflows/apk.yml`.

## Zanim pushniesz na dev — sprawdź lokalnie to samo co CI

```bash
npm ci
npm run typecheck   # tsc --noEmit (strict)
npm run test        # vitest run
npm run build       # expo export --platform android (opcjonalnie, cięższe)
```

Pushuj na `dev` dopiero, gdy `typecheck` i `test` są zielone lokalnie — inaczej
pipeline i tak zatrzyma się na CI i `main` nie dostanie zmian.

## Struktura (skrót)

- `src/screens/` — ekrany, `src/components/` — komponenty UI
- `src/lib/` — logika (feed, format, push, returnCalendar) — pokryta testami w `tests/`
- `src/api/client.ts` — jedyna warstwa komunikacji z API
- `src/state/session.tsx` — sesja/auth
