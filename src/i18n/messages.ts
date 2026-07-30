// Słownik tłumaczeń PL/EN + funkcje dla form zmiennych (liczba mnoga, etykiety).
// Czysty TS (testowalny bez RN). Klucze statyczne trzymamy w `pl`/`en`,
// a formy zależne od liczby/kontekstu liczą funkcje niżej.

export type Lang = "pl" | "en";
export const LANGS: Lang[] = ["pl", "en"];

// Locale BCP-47 do Intl (formatowanie kwot/liczb).
export const localeOf: Record<Lang, string> = { pl: "pl-PL", en: "en-US" };

export const langLabel: Record<Lang, string> = { pl: "Polski", en: "English" };

const pl = {
  nav: {
    offerDetail: "Szczegóły oferty",
    profiles: "Profile",
    developer: "Developer",
    settings: "Ustawienia",
    alerts: "Alerty",
  },
  login: {
    tagline: "Łap odlotowe ceny lotów",
    subLogin: "Zaloguj się na swoje konto.",
    subRegister: "Załóż konto (e-mail i hasło).",
    email: "E-mail",
    password: "Hasło",
    emailPlaceholder: "ty@example.com",
    passwordPlaceholderRegister: "min. 8 znaków",
    passwordPlaceholderLogin: "hasło",
    needCredentials: "Podaj e-mail i hasło.",
    login: "Zaloguj",
    register: "Zarejestruj",
    toRegister: "Nie masz konta? Zarejestruj się",
    toLogin: "Masz już konto? Zaloguj się",
    or: "lub",
    googleHint: "Logowanie Google wymaga konfiguracji (app.json → extra.google). Patrz docs/DEPLOY.md.",
    advancedShow: "Zaawansowane",
    advancedHide: "Ukryj ustawienia",
    apiUrl: "Adres API",
    genericError: "Coś poszło nie tak. Spróbuj ponownie.",
  },
  feed: {
    title: "Najlepsze okazje",
    profiles: "Profile",
    signOut: "Wyloguj",
    waking: "⏳ Budzę serwer, chwilkę…",
    empty: "Brak ofert w ocenie A/B. Dodaj profil i uruchom wyszukiwanie.",
    settings: "Ustawienia",
  },
  offer: {
    back: "Wróć",
    direct: "bezpośredni",
    price: "Cena",
    type: "Typ",
    dates: "Daty",
    changes: "Przesiadki",
    outbound: "Lot tam →",
    whenReturn: "Kiedy wrócić? Wybierz dzień powrotu",
    noReturns: "Brak danych o powrotach w tym oknie. Sprawdź na Aviasales.",
    cacheNote: "Ceny z cache — potwierdź klikając w link.",
    calHint:
      "Cena = najtańszy powrót danego dnia. Kliknij dzień, by zobaczyć lot tam+powrót na Aviasales. Najtańszy dzień podświetlony.",
    tripRound: "w obie strony",
    tripOneway: "w jedną stronę",
    flexPrefix: "💡 taniej o",
    flexThan: "niż",
    retPrefix: "↩ powrót",
    stay: "pobyt",
    total: "razem ~",
  },
  states: {
    loading: "Ładowanie",
    error: "Coś poszło nie tak",
    retry: "Spróbuj ponownie",
  },
  settings: {
    title: "Ustawienia",
    language: "Język",
    currency: "Waluta",
    currencyNote:
      "Ceny przelicza serwer po swoim kursie — aplikacja niczego nie przelicza samodzielnie. Wybór waluty wysyłamy do API i pokazujemy to, co wróci.",
    languageNote: "Język interfejsu. Domyślnie z ustawień urządzenia.",
  },
  common: {
    fail: "Nie udało się",
    cancel: "Anuluj",
    delete: "Usuń",
  },
  profiles: {
    from: "Skąd (dotknij, aby zaznaczyć)",
    scope: "Zakres",
    add: "Dodaj profil",
    selected: "zaznaczone",
    empty: "Brak profili — dodaj pierwszy powyżej.",
    searchNow: "Szukaj teraz",
    searching: "Szukam…",
    alertsLink: "Alerty",
    minGrade: "min. ocena",
    pickCityTitle: "Wybierz miasto",
    pickCityBody: "Zaznacz co najmniej jedno miasto wylotu.",
    deleteTitle: "Usunąć profil?",
    deleteFailTitle: "Nie udało się usunąć",
    searchedTitle: "Wyszukano",
    searchErrTitle: "Błąd wyszukiwania",
    noneFound: "Brak ofert A/B w najbliższych miesiącach dla tego profilu.",
  },
  alerts: {
    notifyWhen: "Powiadom, gdy cena ≤",
    add: "Dodaj",
    addTopDeal: "+ Alert: nowa okazja z oceną A",
    empty: "Brak alertów. Dodaj pierwszy powyżej.",
    badPriceTitle: "Zła cena",
    badPriceBody: "Podaj dodatnią kwotę progu.",
    deleteAlert: "Usuń alert",
    typePriceBelow: "Cena poniżej progu",
    typeTopDeal: "Nowa top okazja",
  },
  cal: {
    weekdays: ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"],
    months: [
      "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
      "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
    ],
  },
};

const en: typeof pl = {
  nav: {
    offerDetail: "Offer details",
    profiles: "Profiles",
    developer: "Developer",
    settings: "Settings",
    alerts: "Alerts",
  },
  login: {
    tagline: "Catch amazing flight deals",
    subLogin: "Sign in to your account.",
    subRegister: "Create an account (e-mail and password).",
    email: "E-mail",
    password: "Password",
    emailPlaceholder: "you@example.com",
    passwordPlaceholderRegister: "min. 8 characters",
    passwordPlaceholderLogin: "password",
    needCredentials: "Enter your e-mail and password.",
    login: "Sign in",
    register: "Sign up",
    toRegister: "No account? Sign up",
    toLogin: "Already have an account? Sign in",
    or: "or",
    googleHint: "Google sign-in needs configuration (app.json → extra.google). See docs/DEPLOY.md.",
    advancedShow: "Advanced",
    advancedHide: "Hide settings",
    apiUrl: "API address",
    genericError: "Something went wrong. Please try again.",
  },
  feed: {
    title: "Best deals",
    profiles: "Profiles",
    signOut: "Sign out",
    waking: "⏳ Waking the server, one moment…",
    empty: "No offers graded A/B. Add a profile and run a search.",
    settings: "Settings",
  },
  offer: {
    back: "Back",
    direct: "direct",
    price: "Price",
    type: "Type",
    dates: "Dates",
    changes: "Stops",
    outbound: "Outbound flight →",
    whenReturn: "When to fly back? Pick a return day",
    noReturns: "No return data in this window. Check on Aviasales.",
    cacheNote: "Cached prices — confirm by opening the link.",
    calHint:
      "Price = cheapest return that day. Tap a day to see the round trip on Aviasales. Cheapest day highlighted.",
    tripRound: "round trip",
    tripOneway: "one way",
    flexPrefix: "💡 cheaper by",
    flexThan: "than",
    retPrefix: "↩ return",
    stay: "stay",
    total: "total ~",
  },
  states: {
    loading: "Loading",
    error: "Something went wrong",
    retry: "Try again",
  },
  settings: {
    title: "Settings",
    language: "Language",
    currency: "Currency",
    currencyNote:
      "Prices are converted by the server at its own rate — the app never converts on its own. We send your currency choice to the API and show whatever comes back.",
    languageNote: "Interface language. Defaults to your device settings.",
  },
  common: {
    fail: "Something went wrong",
    cancel: "Cancel",
    delete: "Delete",
  },
  profiles: {
    from: "From (tap to select)",
    scope: "Scope",
    add: "Add profile",
    selected: "selected",
    empty: "No profiles — add your first above.",
    searchNow: "Search now",
    searching: "Searching…",
    alertsLink: "Alerts",
    minGrade: "min. grade",
    pickCityTitle: "Choose a city",
    pickCityBody: "Select at least one departure city.",
    deleteTitle: "Delete profile?",
    deleteFailTitle: "Couldn't delete",
    searchedTitle: "Search done",
    searchErrTitle: "Search error",
    noneFound: "No A/B offers in the coming months for this profile.",
  },
  alerts: {
    notifyWhen: "Notify when price ≤",
    add: "Add",
    addTopDeal: "+ Alert: new deal graded A",
    empty: "No alerts. Add your first above.",
    badPriceTitle: "Invalid price",
    badPriceBody: "Enter a positive threshold amount.",
    deleteAlert: "Delete alert",
    typePriceBelow: "Price below threshold",
    typeTopDeal: "New top deal",
  },
  cal: {
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    months: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
  },
};

export const messages: Record<Lang, typeof pl> = { pl, en };

// --- Formy zależne od liczby / kontekstu ---

export function pluralNights(n: number | null, lang: Lang): string {
  if (n === null) return lang === "pl" ? "1–7 nocy" : "1–7 nights";
  if (lang === "en") return n === 1 ? "1 night" : `${n} nights`;
  // polska odmiana: 1 noc / 2 noce / 5 nocy
  if (n === 1) return "1 noc";
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} noce`;
  return `${n} nocy`;
}

export function tripLabel(trip: string, lang: Lang): string {
  const m = messages[lang].offer;
  return trip === "round-trip" ? m.tripRound : m.tripOneway;
}

// Etykieta przesiadek dla karty oferty: "bezpośredni" / "1 przes." / "" (nieznane).
export function changesLabel(changes: number | null, lang: Lang): string {
  if (changes === 0) return messages[lang].offer.direct;
  if (changes === null) return "";
  return lang === "pl" ? `${changes} przes.` : `${changes} stop${changes === 1 ? "" : "s"}`;
}

// Treść potwierdzenia usunięcia profilu.
export function deleteProfileBody(name: string, lang: Lang): string {
  return lang === "pl"
    ? `${name} — profil i jego alerty zostaną usunięte.`
    : `${name} — the profile and its alerts will be deleted.`;
}

// Wynik wyszukiwania (liczba znalezionych ofert A/B).
export function searchFoundBody(total: number, lang: Lang): string {
  return lang === "pl"
    ? `Znaleziono ${total} ofert A/B (najbliższe miesiące). Zobacz w feedzie.`
    : `Found ${total} A/B offers (coming months). See them in the feed.`;
}

// Meta alertu: "kanał push · max 3/dzień".
export function alertMeta(channel: string, maxPerDay: number, lang: Lang): string {
  return lang === "pl"
    ? `kanał ${channel} · max ${maxPerDay}/dzień`
    : `channel ${channel} · max ${maxPerDay}/day`;
}

// Czytelna nazwa typu alertu (fallback: surowy typ z API).
export function alertTypeLabel(type: string, lang: Lang): string {
  const m = messages[lang].alerts;
  if (type === "PRICE_BELOW") return m.typePriceBelow;
  if (type === "NEW_TOP_DEAL") return m.typeTopDeal;
  return type;
}
