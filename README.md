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
├── lib/                 # format, feed (pure), useAsync (hook ładowania)
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

## Zakres i dalsze kroki
Zrealizowane: logowanie (adres+token), feed ofert (A/B, powrót, flex, deeplinki),
szczegóły oferty (Lot tam / Powrót), profile (lista/tworzenie/„szukaj teraz”),
alerty (PRICE_BELOW / NEW_TOP_DEAL, usuwanie). Do dopięcia produkcyjnie: logowanie
magic-link, rejestracja tokenu push (Expo Notifications), i18n, publikacja w sklepach (M7/CD).
