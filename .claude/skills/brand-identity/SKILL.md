---
name: brand-identity
description: Twórz i aktualizuj tożsamość wizualną „Odlot" — logo/mark, nazwę, splash, ikonę aplikacji i ikonę powiadomień. Renderuje realne PNG-i z SVG bez zewnętrznych zależności (chromium headless). Użyj, gdy ktoś prosi o „nowe logo", „ikonę", „splash", „ikonę powiadomień", „odśwież branding", zmianę palety marki albo asset do wydania. Wyzwalacze: "logo", "ikona", "splash", "branding", "marka", "notification icon".
---

# brand-identity — tożsamość wizualna „Odlot"

Marka: **Odlot** — dwuznaczność „odlot samolotu" + slang „odlotowe" (rewelacyjne).
Tagline: **„Łap odlotowe ceny lotów"**. Znak: papierowy samolot (send/scout) na koralowym
gradiencie „sunset", z subtelnymi pierścieniami radaru (nawiązanie do *flight-scout*) i śladem lotu.

Tokeny marki żyją w **`src/theme.ts`** (`colors.brand` = `#FF5A5F`, `brandTop` `#FF8A5B`,
`brandDeep` `#F0416E`, `ink` `#141B2E`). Zmiana palety = zmiana `theme.ts` **oraz** regeneracja assetów.

## Assety i ich specyfikacja

| Plik | Rozmiar | Tło | Treść |
|---|---|---|---|
| `assets/icon.png` | 1024² | pełny gradient, `rx=224` | biały samolot + radar + ślad |
| `assets/adaptive-foreground.png` | 1024² | **transparent** | biały samolot w strefie bezpiecznej (center ~66%); tło z `app.json` (`#FF5A5F`) |
| `assets/splash.png` | 1080² | ink (`#141B2E`) wypalony | samolot (gradient) + wordmark „Odlot" + tagline |
| `assets/notification-icon.png` | 192² | **transparent** | **płaska biała sylwetka** (Android sam ją tintuje — żadnych kolorów/gradientów) |

Zgodność z `app.json`: `splash.backgroundColor="#141B2E"`, `android.adaptiveIcon.backgroundColor="#FF5A5F"`.

## Jak wyrenderować PNG z SVG (bez instalacji)

W środowisku jest chromium (Playwright) — używamy trybu `--headless --screenshot`, więc
**nie potrzeba** `sharp`/ImageMagick/Inkscape. Wzorzec:

```bash
CHROME=/opt/pw-browsers/chromium-*/chrome-linux/chrome
"$CHROME" --headless --no-sandbox --hide-scrollbars \
  --force-device-scale-factor=1 --default-background-color=00000000 \
  --screenshot=out.png --window-size=1024,1024 file://$PWD/in.html
```

- `--default-background-color=00000000` → przezroczyste tło (kluczowe dla foreground/notyfikacji).
- HTML = `<body>` z jednym `<svg width=H height=H>`; `margin:0;padding:0` na `html,body`.
- Weryfikuj rozmiar: `node -e "const b=require('fs').readFileSync('out.png');console.log(b.readUInt32BE(16)+'x'+b.readUInt32BE(20))"`.

Gotowy generator wszystkich czterech assetów: patrz `docs/brand/gen.js` (uruchom `node docs/brand/gen.js ./assets`).

## Geometria znaku (paper plane)

Układ 0..120, dwa skrzydła (górne jasne, dolne = fałda ciemniejsza):
- górne: `points="116,10 8,44 58,64"`
- dolne: `points="116,10 58,64 70,118"` (opacity ~0.72 dla efektu fałdy; **1.0 i jednolity kolor** dla ikony powiadomień)
- ślad: 3 malejące kropki w lewym-dolnym rogu (pomijane w notyfikacji — za drobne).

## Zasady

- **Ikona powiadomień musi być monochromatyczna** (czysta biel na transparencie). Kolor/gradient
  → Android pokaże biały kwadrat. To najczęstszy błąd — sprawdzaj zawsze.
- Znak trzymaj w strefie bezpiecznej adaptive icon (treść w centralnych ~66%).
- Po każdej zmiany palety: zaktualizuj `src/theme.ts`, regeneruj assety, sprawdź podglądy,
  zweryfikuj `app.json` (kolory tła), commit na `dev`.
- Zmiana nazwy marki: `app.json` (`name`), `src/theme.ts` (`BRAND.name`), splash (regeneracja).
  NIE ruszaj `slug`/`android.package` (łamie EAS i instalacje).

## Współpraca

Układ i UX ekranów opisuje skill **`mobile-ui-ux`**. Audyt buildu/wydania APK: skill `apk-audit`.
