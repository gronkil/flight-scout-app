// Marka „Odlot" — jedno źródło prawdy dla kolorów, promieni i typografii.
// Wprowadzone razem z odświeżeniem wizualnym (logo/splash/ikona powiadomień).
// Zasady: siatka 8pt, reguła kolorów 60/30/10, koral jako akcent (10%).

export const BRAND = {
  name: "Odlot",
  tagline: "Łap odlotowe ceny lotów",
} as const;

export const colors = {
  // Akcent marki (koral / „sunset")
  brand: "#FF5A5F",
  brandTop: "#FF8A5B",
  brandDeep: "#F0416E",

  // Powierzchnie
  ink: "#141B2E", // ciemne tło (splash, ewentualny dark header)
  bg: "#F1F5F9", // tło ekranów
  surface: "#FFFFFF", // karty
  border: "#E5E7EB",

  // Tekst
  text: "#141B2E",
  textMuted: "#64748B",
  textFaint: "#94A3B8",

  // Semantyka ocen / stanów
  gradeA: "#12B981",
  savings: "#F59E0B",
  danger: "#DC2626",
} as const;

// Odznaki ocen — żywa paleta zgodna z makietą „Odlot" (A zielony, B niebieski,
// C bursztyn, D czerwony). Kolor niesie znaczenie, nie dekorację.
export const gradeBadge = {
  A: "#12B981",
  B: "#3B82F6",
  C: "#F59E0B",
  D: "#DC2626",
  unknown: "#64748B",
} as const;

// Miękki cień kart (spójny across ekranów). Na Androidzie działa `elevation`,
// na iOS cień właściwy — podajemy oba.
export const cardShadow = {
  shadowColor: "#141B2E",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
} as const;

export const radius = { sm: 8, md: 14, lg: 20, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
