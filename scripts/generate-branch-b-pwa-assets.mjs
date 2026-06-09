import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SCREENSHOT_DIR = path.join(ROOT, 'screenshots');
const ICON_DIR = path.join(ROOT, 'icons');
const WIDTH = 1672;
const HEIGHT = 941;

const proofs = [
  {
    file: 'branch-b-proof-landing.webp',
    kicker: 'LANDING PROOF',
    title: 'Hex Compiler is playable, installable, and clear before first click.',
    primary: 'CTA → play.html',
    secondary: 'SEO/GEO + PWA metadata remain visible to humans and crawlers.',
    panels: ['Hero promise', 'Offline-capable', 'Open source', 'No account gate'],
  },
  {
    file: 'branch-b-proof-game-shell.webp',
    kicker: 'GAME SHELL PROOF',
    title: 'The shell foregrounds actual game state, not decorative chrome.',
    primary: 'ESSENCE_BUFFER + EXEC are above the fold',
    secondary: 'Tabs, sidebar, cast deck, and workstations stay legible at wide viewport.',
    panels: ['HUD', 'Resource monitor', 'Workstations', 'Control deck'],
  },
  {
    file: 'branch-b-proof-pwa-assets.webp',
    kicker: 'PWA ASSET PROOF',
    title: 'Install surfaces now use matching kyanite/corruption artwork.',
    primary: 'Maskable PNG icons regenerated',
    secondary: 'Manifest screenshots are wide, proof-first, and exactly 1672×941 WebP.',
    panels: ['144 PNG', '192 PNG', '512 PNG', '4× WebP shots'],
  },
  {
    file: 'branch-b-proof-offline-cache.webp',
    kicker: 'OFFLINE PROOF',
    title: 'The service worker knows about the new proof and icon assets.',
    primary: 'CACHE_VERSION bumped',
    secondary: 'New screenshots/icons are best-effort cached without breaking install.',
    panels: ['Atomic core', 'Optional assets', 'Runtime images', 'Offline fallback'],
  },
];

function esc(str) {
  return String(str).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function proofSvg(proof) {
  const panelSvg = proof.panels.map((label, index) => {
    const x = 108 + index * 364;
    return `
      <g transform="translate(${x},708)">
        <rect width="312" height="98" rx="22" fill="rgba(8, 13, 20, .84)" stroke="rgba(38,230,255,.28)"/>
        <path d="M28 68 L88 28 L154 60 L220 22 L284 54" fill="none" stroke="${index % 2 ? '#ff2f6d' : '#26e6ff'}" stroke-width="5" stroke-linecap="round"/>
        <text x="26" y="38" fill="#c3d4e2" font-size="22" font-family="JetBrains Mono, monospace" font-weight="700">${esc(label)}</text>
      </g>`;
  }).join('');

  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#05070b"/>
        <stop offset=".45" stop-color="#081522"/>
        <stop offset="1" stop-color="#120817"/>
      </linearGradient>
      <linearGradient id="logo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#26e6ff"/>
        <stop offset="1" stop-color="#ff2f6d"/>
      </linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="18" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <pattern id="grid" width="52" height="52" patternUnits="userSpaceOnUse"><path d="M52 0H0V52" fill="none" stroke="rgba(38,230,255,.08)" stroke-width="1"/></pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    <circle cx="1370" cy="170" r="300" fill="rgba(255,47,109,.22)" filter="url(#glow)"/>
    <circle cx="270" cy="780" r="260" fill="rgba(38,230,255,.18)" filter="url(#glow)"/>

    <rect x="76" y="72" width="1520" height="797" rx="44" fill="rgba(5,7,11,.72)" stroke="rgba(195,212,226,.18)" stroke-width="2"/>
    <rect x="108" y="104" width="1456" height="78" rx="24" fill="rgba(14,27,41,.82)" stroke="rgba(38,230,255,.25)"/>
    <text x="138" y="153" fill="#33ff99" font-size="26" font-family="JetBrains Mono, monospace" font-weight="800">${esc(proof.kicker)}</text>
    <text x="1430" y="153" fill="#8297aa" font-size="22" font-family="JetBrains Mono, monospace" text-anchor="end">1672×941 WEBP</text>

    <text x="108" y="306" fill="#f3f8ff" font-size="64" font-family="Space Grotesk, Arial, sans-serif" font-weight="800">${esc(proof.title)}</text>
    <rect x="108" y="366" width="1040" height="98" rx="24" fill="rgba(38,230,255,.10)" stroke="rgba(38,230,255,.36)"/>
    <text x="144" y="426" fill="#26e6ff" font-size="32" font-family="JetBrains Mono, monospace" font-weight="800">${esc(proof.primary)}</text>
    <text x="108" y="532" fill="#c3d4e2" font-size="34" font-family="Space Grotesk, Arial, sans-serif" font-weight="600">${esc(proof.secondary)}</text>

    <g transform="translate(1244,274)">
      <rect width="246" height="246" rx="58" fill="url(#logo)" opacity=".92"/>
      <rect x="30" y="30" width="186" height="186" rx="42" fill="#05070b" opacity=".90"/>
      <path d="M123 48 L64 152 H182 Z" fill="none" stroke="#26e6ff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M78 126 H168 M96 152 H150" stroke="#ff2f6d" stroke-width="12" stroke-linecap="round"/>
      <text x="123" y="205" fill="#f3f8ff" font-size="42" font-family="JetBrains Mono, monospace" text-anchor="middle" font-weight="900">0x</text>
    </g>
    ${panelSvg}
    <text x="108" y="844" fill="#8297aa" font-size="22" font-family="JetBrains Mono, monospace">BRANCH_B_ASSET_PROOF / generated from scripts/generate-branch-b-pwa-assets.mjs</text>
  </svg>`;
}

function iconSvg(size) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#05070b"/><stop offset="1" stop-color="#141022"/></linearGradient>
      <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#26e6ff"/><stop offset="1" stop-color="#ff2f6d"/></linearGradient>
      <filter id="g"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="512" height="512" rx="112" fill="url(#bg)"/>
    <circle cx="374" cy="130" r="96" fill="rgba(255,47,109,.20)" filter="url(#g)"/>
    <circle cx="138" cy="376" r="112" fill="rgba(38,230,255,.16)" filter="url(#g)"/>
    <rect x="82" y="82" width="348" height="348" rx="82" fill="rgba(8,13,20,.86)" stroke="rgba(38,230,255,.34)" stroke-width="10"/>
    <path d="M256 126 L144 322 H368 Z" fill="none" stroke="url(#mark)" stroke-width="28" stroke-linejoin="round"/>
    <path d="M174 270 H338 M208 322 H304" stroke="#f5d35c" stroke-width="24" stroke-linecap="round"/>
    <text x="256" y="390" fill="#f3f8ff" font-size="74" font-family="JetBrains Mono, monospace" text-anchor="middle" font-weight="900">0x</text>
  </svg>`;
}

await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
await fs.mkdir(ICON_DIR, { recursive: true });

for (const proof of proofs) {
  await sharp(Buffer.from(proofSvg(proof))).webp({ quality: 86, effort: 6 }).toFile(path.join(SCREENSHOT_DIR, proof.file));
  const meta = await sharp(path.join(SCREENSHOT_DIR, proof.file)).metadata();
  if (meta.width !== WIDTH || meta.height !== HEIGHT || meta.format !== 'webp') {
    throw new Error(`${proof.file} expected ${WIDTH}x${HEIGHT} webp, got ${meta.width}x${meta.height} ${meta.format}`);
  }
}

for (const size of [144, 192, 512]) {
  await sharp(Buffer.from(iconSvg(size))).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(path.join(ICON_DIR, `icon-${size}x${size}.png`));
}

console.log(`Generated ${proofs.length} proof WebP screenshots at ${WIDTH}x${HEIGHT} and regenerated PWA PNG icons.`);
