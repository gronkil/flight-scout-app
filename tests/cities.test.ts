import { describe, expect, it } from "vitest";

import { availableCities, cityByCode, cityLabel, POLISH_CITIES } from "../src/lib/cities";

describe("cities", () => {
  it("kody IATA są unikalne", () => {
    const codes = POLISH_CITIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("cityByCode znajduje miasto niezależnie od wielkości liter i spacji", () => {
    expect(cityByCode("waw")?.name).toBe("Warszawa (Chopina)");
    expect(cityByCode(" KRK ")?.name).toBe("Kraków");
    expect(cityByCode("ZZZ")).toBeUndefined();
  });

  it("cityLabel zwraca nazwę dla znanego kodu, a sam kod dla nieznanego", () => {
    expect(cityLabel("GDN")).toBe("Gdańsk");
    expect(cityLabel("xyz")).toBe("XYZ");
  });

  it("availableCities wyklucza już wybrane miasta (blokada duplikatów)", () => {
    const available = availableCities(["WAW", "krk"]);
    const codes = available.map((c) => c.code);
    expect(codes).not.toContain("WAW");
    expect(codes).not.toContain("KRK");
    expect(codes.length).toBe(POLISH_CITIES.length - 2);
  });

  it("availableCities bez wyborów zwraca pełną listę", () => {
    expect(availableCities([]).length).toBe(POLISH_CITIES.length);
  });
});
