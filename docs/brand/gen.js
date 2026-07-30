// Generator assetów marki "Odlot" — renderuje SVG->PNG przez chromium headless.
const { execFileSync, execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

// Wyszukaj binarkę chromium (Playwright) — bez sztywnej wersji.
const CHROME = execSync("ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome").toString().trim().split("\n")[0];
const OUT = process.argv[2] || ".";
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "odlot-"));

// --- Paleta ---
const CORAL_TOP = "#FF8A5B";
const CORAL = "#FF5A5F";
const CORAL_DEEP = "#F0416E";
const INK = "#141B2E";
const SLATE300 = "#CBD5E1";

// Paper-plane mark w układzie 0..120. Dwa skrzydła: górne (jasne) i dolne (fałda, ciemniejsze).
function planeSVG({ fill = "#fff", flat = false, foldOpacity = 0.72 } = {}) {
  const upper = "116,10 8,44 58,64"; // tip, tailTop, center
  const lower = "116,10 58,64 70,118"; // tip, center, tailBottom
  return `
    <polygon points="${upper}" fill="${fill}"/>
    <polygon points="${lower}" fill="${fill}" opacity="${flat ? 1 : foldOpacity}"/>
  `;
}

// dashed trail (3 malejące kropki) — do wersji kolorowych, nie do notyfikacji
function trailSVG(fill) {
  return `
    <circle cx="30" cy="94" r="6" fill="${fill}" opacity="0.9"/>
    <circle cx="17" cy="82" r="4.5" fill="${fill}" opacity="0.6"/>
    <circle cx="8" cy="72" r="3" fill="${fill}" opacity="0.35"/>
  `;
}

function html(size, svgInner, viewBox = `0 0 ${size} ${size}`) {
  return `<!doctype html><html><head><style>html,body{margin:0;padding:0}</style></head>
<body><svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">${svgInner}</svg></body></html>`;
}

function render(name, size, svgInner) {
  const inFile = path.join(TMP, name + ".html");
  const outFile = path.join(OUT, name + ".png");
  fs.writeFileSync(inFile, html(size, svgInner));
  execFileSync(CHROME, [
    "--headless", "--no-sandbox", "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--default-background-color=00000000",
    `--screenshot=${outFile}`,
    `--window-size=${size},${size}`,
    `file://${inFile}`,
  ], { stdio: "ignore" });
  const b = fs.readFileSync(outFile);
  console.log(`${name}.png  ${b.readUInt32BE(16)}x${b.readUInt32BE(20)}  ${(b.length/1024).toFixed(1)}kB`);
}

const gradient = `
  <defs>
    <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${CORAL_TOP}"/>
      <stop offset="0.5" stop-color="${CORAL}"/>
      <stop offset="1" stop-color="${CORAL_DEEP}"/>
    </linearGradient>
    <linearGradient id="sunV" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${CORAL_TOP}"/>
      <stop offset="0.55" stop-color="${CORAL}"/>
      <stop offset="1" stop-color="${CORAL_DEEP}"/>
    </linearGradient>
  </defs>`;

// radar rings (nawiązanie do "scout") — subtelne białe okręgi
function radar(cx, cy) {
  return `
    <circle cx="${cx}" cy="${cy}" r="360" fill="none" stroke="#fff" stroke-width="3" opacity="0.10"/>
    <circle cx="${cx}" cy="${cy}" r="262" fill="none" stroke="#fff" stroke-width="3" opacity="0.13"/>
    <circle cx="${cx}" cy="${cy}" r="168" fill="none" stroke="#fff" stroke-width="3" opacity="0.16"/>`;
}

// 1) icon.png — 1024, pełny gradient + radar + biały samolot
{
  const S = 1024;
  const rings = radar(512, 470);
  const plane = `<g transform="translate(250,232) scale(4.5)">${trailSVG("#fff")}${planeSVG({ fill: "#fff" })}</g>`;
  render("icon", S, `${gradient}
    <rect width="${S}" height="${S}" rx="224" fill="url(#sun)"/>
    ${rings}
    ${plane}`);
}

// 2) adaptive-foreground.png — 1024, transparent, mark w strefie bezpiecznej (center ~66%)
{
  const S = 1024;
  // plane ~ 470px szer, wyśrodkowany
  const plane = `<g transform="translate(300,300) scale(4.0)">${trailSVG("#fff")}${planeSVG({ fill: "#fff" })}</g>`;
  render("adaptive-foreground", S, `${plane}`);
}

// 3) splash.png — 1080, ink bg + lockup (mark + wordmark + tagline). Ink wypalony,
//    żeby na wysokich ekranach zlewał się z backgroundColor z app.json.
{
  const S = 1080;
  function planeSVGGrad() {
    const upper = "116,10 8,44 58,64";
    const lower = "116,10 58,64 70,118";
    return `${trailSVG(CORAL)}
      <polygon points="${upper}" fill="url(#sunV)"/>
      <polygon points="${lower}" fill="${CORAL_DEEP}"/>`;
  }
  const plane = `<g transform="translate(379,150) scale(2.6)">${planeSVGGrad()}</g>`;
  const wordmark = `
    <text x="540" y="660" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
      font-size="158" font-weight="800" fill="#FFFFFF" letter-spacing="-5">Odlot</text>
    <text x="540" y="732" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
      font-size="40" font-weight="600" fill="${SLATE300}" letter-spacing="0.5">Łap odlotowe ceny lotów</text>`;
  render("splash", S, `${gradient}
    <rect width="${S}" height="${S}" fill="${INK}"/>
    ${plane}${wordmark}`);
}

// 4) notification-icon.png — 192, biała płaska sylwetka na transparent (system tintuje)
{
  const S = 192;
  const plane = `<g transform="translate(30,30) scale(1.1)">${planeSVG({ fill: "#fff", flat: true })}</g>`;
  render("notification-icon", S, `${plane}`);
}

console.log("OK ->", OUT);
