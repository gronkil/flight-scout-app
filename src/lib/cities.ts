// Lista polskich miast wylotowych — mapujemy przyjazną nazwę na kod IATA lotniska.
// Dzięki temu użytkownik wybiera „Warszawa", a nie musi znać skrótu „WAW".
// Czysty TypeScript (bez RN) → testowalny w Vitest.

export interface City {
  code: string; // kod IATA lotniska (wysyłany do API jako origin)
  name: string; // polska nazwa do wyświetlenia
}

// Miasta z lotniskami obsługującymi połączenia (sort: alfabetycznie po nazwie).
// Warszawa ma dwa lotniska (Chopina + Modlin) — rozróżniamy je nazwą.
export const POLISH_CITIES: City[] = [
  { code: "BZG", name: "Bydgoszcz" },
  { code: "GDN", name: "Gdańsk" },
  { code: "KTW", name: "Katowice" },
  { code: "KRK", name: "Kraków" },
  { code: "LUZ", name: "Lublin" },
  { code: "LCJ", name: "Łódź" },
  { code: "SZY", name: "Olsztyn-Mazury" },
  { code: "POZ", name: "Poznań" },
  { code: "RDO", name: "Radom" },
  { code: "RZE", name: "Rzeszów" },
  { code: "SZZ", name: "Szczecin" },
  { code: "WAW", name: "Warszawa (Chopina)" },
  { code: "WMI", name: "Warszawa-Modlin" },
  { code: "WRO", name: "Wrocław" },
  { code: "IEG", name: "Zielona Góra" },
];

export function cityByCode(code: string): City | undefined {
  const target = code.trim().toUpperCase();
  return POLISH_CITIES.find((c) => c.code === target);
}

// Etykieta do wyświetlenia: „Warszawa (Chopina)" dla znanego kodu, w przeciwnym razie sam kod.
export function cityLabel(code: string): string {
  return cityByCode(code)?.name ?? code.trim().toUpperCase();
}

// Miasta możliwe do dodania = wszystkie oprócz już wybranych (blokada duplikatów).
export function availableCities(selected: string[]): City[] {
  const chosen = new Set(selected.map((c) => c.trim().toUpperCase()));
  return POLISH_CITIES.filter((c) => !chosen.has(c.code));
}
