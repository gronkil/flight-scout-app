---
name: mobile-ui-ux
description: Projektuj i recenzuj UI/UX ekranów mobilnych aplikacji „Odlot" (Expo/React Native). Użyj, gdy ktoś prosi o nowy ekran, poprawę wyglądu, spójność wizualną, dostępność (a11y), hierarchię, siatkę/odstępy, stany (loading/empty/error) albo „zrób to ładniej / bardziej pro". Wyzwalacze: "ekran", "UI", "UX", "wygląd", "layout", "dostępność", "spójność", "komponent".
---

# mobile-ui-ux — projektowanie ekranów „Odlot"

Aplikacja mobilna (Expo / React Native / TypeScript). Jedno źródło tokenów: **`src/theme.ts`**
(`BRAND`, `colors`, `radius`, `space`). NIE wpisuj kolorów/rozmiarów na sztywno — importuj z motywu.

Inspiracje (wzorce z najlepszych aplikacji podróżniczych i fintech: Airbnb, Revolut, Duolingo,
Hopper). Zasady poniżej to destylat publicznych skilli UI/UX dla Claude Code.

## Twarde zasady (trzymaj się ich)

1. **Siatka 8pt.** Wszystkie odstępy/rozmiary = wielokrotność 4, najlepiej 8
   (`space.xs=4, sm=8, md=12, lg=16, xl=24`). Żadnych „13px z palca".
2. **Reguła kolorów 60/30/10.** 60% neutralne tło (`colors.bg`), 30% powierzchnie/tekst
   (`surface`, `text`, `textMuted`), 10% akcent marki (`colors.brand`). Koral to akcent
   (CTA, aktywne, cena), nie tło całych ekranów.
3. **Typografia oszczędna.** Maks. ~4 rozmiary, 2 grubości na ekran. Skala:
   nagłówek 28–34/800, tytuł sekcji 20–22/800, tytuł karty 16–17/700, tekst 14–15/500,
   meta 12–13/500. `letterSpacing: -1` przy dużych nagłówkach.
4. **Promienie i cień.** Karty `radius.md` (14), pill `radius.pill`. Cień subtelny
   (elevation 1–2 / shadowOpacity ≤ 0.08) — bez ciężkich ramek + cieni naraz.
5. **Thumb zone.** Główne akcje w dolnej 1/3 ekranu, w zasięgu kciuka. Nagłówkowe
   „mniej ważne" akcje (Profile, 🛠) na górze.
6. **Cel dotykowy ≥ 44×44 pt.** Każdy `TouchableOpacity` ma realny obszar dotyku.

## Dostępność (a11y) — obowiązkowo

- Każdy element interaktywny: `accessibilityRole="button"` + sensowny `accessibilityLabel`
  (opis PO POLSKU, np. „Pokaż szczegóły oferty do Barcelony za 189 zł").
- Kontrast tekstu ≥ 4.5:1. `textFaint` (#94A3B8) tylko dla drobnej metadanej, nie dla treści.
- Stany ładowania/błędu mają etykiety (patrz `components/StateViews.tsx`).
- Nie koduj informacji wyłącznie kolorem (ocena A/B ma też literę w `GradeBadge`).

## Wzorzec ekranu

Każdy ekran ma świadomie zaprojektowane **cztery stany**: `loading`, `error`, `empty`, `ready`.
Używaj gotowych `Loading / ErrorView / EmptyView` z `components/StateViews.tsx` — nie wymyślaj
własnych spinnerów. Puste stany są konkretne i prowadzą do akcji („Dodaj profil i uruchom
wyszukiwanie"), nie samego „Brak danych".

## Karta oferty (`OfferCard`) — wzorzec listy

- Lewa kolumna: miasto (mocno) + kod IATA (przygaszony), meta (typ/daty/przesiadki),
  opcjonalnie „💡 taniej o…" i „↩ powrót…".
- Prawa kolumna: **cena** (największy, 800) + `GradeBadge`.
- Cena to jedyny element w koralu/inku o dużej wadze — to ona sprzedaje.
- `FlatList`: `initialNumToRender`, `windowSize`, `removeClippedSubviews` dla płynności.

## Zanim uznasz ekran za gotowy — checklista

- [ ] Odstępy = wielokrotności 8; brak przypadkowych wartości.
- [ ] Kolory tylko z `colors` (motyw), akcent ≤ ~10% powierzchni.
- [ ] Maks. 4 rozmiary / 2 grubości tekstu.
- [ ] Cztery stany obsłużone (loading/error/empty/ready).
- [ ] a11y: role + etykiety PL na każdym interaktywnym elemencie.
- [ ] `npm run typecheck` i `npm run test` zielone (patrz CLAUDE.md).

## Język i waluta (i18n) — obowiązkowo dla nowych ekranów

Aplikacja jest dwujęzyczna (PL/EN) i wielowalutowa. **Żadnych napisów na sztywno.**

- Teksty: `const { t } = useI18n()` (`src/i18n`), klucze w `src/i18n/messages.ts`.
  Dodając napis — dopisz go w `pl` **i** `en` (test `tests/i18n.test.ts` pilnuje parytetu kluczy).
- Kwoty: `const { money } = useI18n(); money(price, offer.currency)` — formatuje wg locale.
  **Nie przeliczaj walut w kliencie** — kwota i kod przychodzą z API (backend wycenia po swoim kursie).
- Formy zmienne: `nights(n)`, `trip(tripType)`, `changes(n)` z hooka (odmiana per język).
- Zapytania o oferty przekazują wybraną walutę: `client.listOffers({ ..., currency })`,
  a `currency` w `deps` `useAsync` odświeża feed po zmianie.
- Ustawienia języka/waluty: ekran `SettingsScreen` (zapamiętane w SecureStore, domyślne z `Intl`).

## Współpraca

Warstwę wizualną marki (logo, splash, ikona powiadomień, paleta) opisuje skill
**`brand-identity`**. Zmiany w wyglądzie ekranów rób na gałęzi `dev` (nigdy na `main`).
