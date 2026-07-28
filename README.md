# flight-scout — aplikacja mobilna (Expo / React Native)

Klient mobilny do przeglądania okazji, profili i alertów. **Rozmawia wyłącznie z naszym
REST API** (backend/) — nigdy wprost z Travelpayouts — i **nie trzyma żadnych sekretów**
(token/klucz podaje użytkownik przy logowaniu; marker afiliacyjny dokleja backend).

## Stack
Expo SDK 51 · React Native 0.74 · React Navigation · TypeScript (strict). Rdzeń
(klient API, modele, formatery, logika feedu) jest czystym TS — testowany Vitest bez natywu.

## Struktura
```
src/
├── api/client.ts        # typowany klient REST (fetch wstrzykiwalny) — zero sekretów
├── model/types.ts       # DTO = lustro kontraktu API (schemas.py)
├── lib/                 # format, feed (pure), returnCalendar (pure builder siatki), useAsync (hook)
├── state/session.tsx    # kontekst sesji (baseUrl + token → ApiClient)
├── components/          # GradeBadge, OfferCard, StateViews (loading/error/empty, a11y)
└── screens/             # Login, Feed, OfferDetail, Profiles, Alerts
App.tsx                  # nawigacja (native stack)
```

## Uruchomienie
```bash
cd mobile
npm install
npm run start        # Expo (skanuj QR w Expo Go) — ustaw adres API na ekranie logowania
npm run typecheck    # tsc --noEmit (strict)
npm run test         # Vitest — rdzeń (klient/format/feed)
```

Domyślny adres API: `http://localhost:8000` (edytowalny na ekranie logowania). Backend:
`uvicorn config.asgi:app` w `../backend`.

## Bramki (G4)
- TS strict + typecheck całości; testy rdzenia (Vitest).
- Zero sekretów w kliencie; komunikacja tylko z naszym API.
- Stany ładowania/błędu/pustki i podstawy dostępności (etykiety, role) w komponentach.

## Push
Aplikacja **sama rejestruje** urządzenie do powiadomień przy pierwszym wejściu do feedu
(`expo-notifications`, po zgodzie). Token trafia do backendu przez `POST /devices` dla
użytkownika `owner` — tego samego, którego używa worker. Na emulatorze/bez zgody push jest
cicho pomijany.

## Zakres i dalsze kroki
Zrealizowane: logowanie (adres+token), feed ofert (A/B, powrót, flex, deeplinki),
szczegóły oferty (Lot tam + **kalendarz powrotów** — siatka miesiąca „kiedy wrócić”),
profile (lista/tworzenie/„szukaj teraz”),
alerty (PRICE_BELOW / NEW_TOP_DEAL, usuwanie), **auto-rejestracja push**, adres API z
konfiguracji (`app.json`). Do dopięcia produkcyjnie: logowanie magic-link (wiele kont),
i18n, publikacja w sklepach (CD).
