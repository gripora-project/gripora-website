// Generates the interim Gripora logo set as plain SVG (no fonts, no external refs).
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = process.argv[2] || "out";
mkdirSync(OUT, { recursive: true });

const ACCENT = "#FF5F1F"; // grip orange
const INK = "#16181D";    // near-black for light backgrounds
const WHITE = "#FFFFFF";  // for dark backgrounds

// Slanted tread grooves cut into the outer half of the ring (directional tyre tread).
function treadCuts() {
  const N = 28, cx = 64, cy = 64, r0 = 45.5, r1 = 54, slant = 7; // degrees
  let d = "";
  for (let i = 0; i < N; i++) {
    const a0 = (i * 360) / N, a1 = a0 + slant, rad = Math.PI / 180;
    const x0 = cx + r0 * Math.cos(a0 * rad), y0 = cy + r0 * Math.sin(a0 * rad);
    const x1 = cx + r1 * Math.cos(a1 * rad), y1 = cy + r1 * Math.sin(a1 * rad);
    d += `M${x0.toFixed(2)} ${y0.toFixed(2)}L${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  return `<path d="${d}" stroke="#000" stroke-width="3.6" stroke-linecap="butt"/>`;
}

// ---- Icon: a tyre drawn as a "G" (128x128) --------------------------------
// Treaded ring, open at the upper right, with an orange crossbar (heading line).
function iconBody(ink, id) {
  return `
  <defs>
    <mask id="tread-${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="128" height="128">
      <rect width="128" height="128" fill="#fff"/>
      ${treadCuts()}
    </mask>
  </defs>
  <path d="M97.7 35.7 A44 44 0 1 0 108 64" fill="none" stroke="${ink}" stroke-width="18"
        mask="url(#tread-${id})"/>
  <rect x="62" y="55" width="51" height="18" fill="${ACCENT}"/>`;
}

function iconSvg(ink, id, bg) {
  const back = bg ? `<rect width="128" height="128" rx="28" fill="${bg}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <title>Gripora</title>${back}${iconBody(ink, id)}
</svg>
`;
}

// ---- Wordmark: GRIPORA, squared and slanted --------------------------------
// Letters are stroked centre-lines on a 40-unit cap height (y 10..50), stroke 8.
function letter(ch, x) {
  const L = x + 4, R = x + 24, T = 14, B = 46, M = 30;
  switch (ch) {
    case "G": return { w: 28, d: `M${R} ${T}H${L}V${B}H${R}V${M}H${x + 15}` };
    case "R": return { w: 28, d: `M${L} ${B + 4}V${T}H${R}V${M}H${L}M${x + 13} ${M}L${R} ${B + 4}` };
    case "I": return { w: 8, d: `M${L} ${T - 4}V${B + 4}` };
    case "P": return { w: 28, d: `M${L} ${B + 4}V${T}H${R}V${M}H${L}` };
    case "A": return { w: 28, d: `M${L} ${B + 4}V${T}H${R}V${B + 4}M${L} 32H${R}` };
    default: throw new Error(ch);
  }
}

function wordmark(ink, x0) {
  let x = x0, d = "", o = "";
  for (const ch of "GRIPORA") {
    if (ch === "O") {
      // the "O" is an orange tyre ring
      o = `<circle cx="${x + 14}" cy="30" r="16" fill="none" stroke="${ACCENT}" stroke-width="8"/>`;
      x += 28 + 8;
      continue;
    }
    const l = letter(ch, x);
    d += l.d;
    x += l.w + 8;
  }
  return {
    width: x - 8 - x0,
    svg: `<defs><clipPath id="cap"><rect x="0" y="10" width="2000" height="40"/></clipPath></defs>
  <g transform="translate(11 0) skewX(-12)" clip-path="url(#cap)">
    <path d="${d}" fill="none" stroke="${ink}" stroke-width="8" stroke-linejoin="miter" stroke-linecap="butt"/>
    ${o}
  </g>`,
  };
}

// Horizontal lockup: icon + wordmark
function lockup(ink, id) {
  const s = 60 / 128;
  const wm = wordmark(ink, 76);
  const W = Math.ceil(76 + wm.width + 14);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 60" width="${W * 2}" height="120">
  <title>Gripora</title>
  <g transform="scale(${s})">${iconBody(ink, id)}</g>
  ${wm.svg}
</svg>
`;
}

// Wordmark only
function wordOnly(ink) {
  const wm = wordmark(ink, 2);
  const W = Math.ceil(wm.width + 16);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 60" width="${W * 2}" height="120">
  <title>Gripora</title>
  ${wm.svg}
</svg>
`;
}

const files = {
  "gripora_icon.svg": iconSvg(INK, "i"),
  "gripora_icon_white.svg": iconSvg(WHITE, "iw"),
  "gripora_icon_tile.svg": iconSvg(WHITE, "it", INK), // app icon / favicon tile
  "gripora_logo_dark.svg": lockup(INK, "l"),          // for light backgrounds
  "gripora_logo_white.svg": lockup(WHITE, "lw"),      // for dark backgrounds
  "gripora_wordmark_dark.svg": wordOnly(INK),
  "gripora_wordmark_white.svg": wordOnly(WHITE),
};
for (const [n, c] of Object.entries(files)) writeFileSync(`${OUT}/${n}`, c);
console.log(Object.keys(files).join("\n"));
