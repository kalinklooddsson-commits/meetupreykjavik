const scenePalettes = {
  indigo: {
    top: "#3730A3",
    bottom: "#1E1B2E",
    accent: "#E8614D",
    glow: "#C7D2FE",
    text: "#FFFFFF",
  },
  coral: {
    top: "#E8614D",
    bottom: "#2A2638",
    accent: "#F5F0E8",
    glow: "#FDE8E4",
    text: "#FFFFFF",
  },
  sage: {
    top: "#7C9A82",
    bottom: "#2A2638",
    accent: "#F5F0E8",
    glow: "#D4E4D7",
    text: "#FFFFFF",
  },
  sand: {
    top: "#F5F0E8",
    bottom: "#DDD7CB",
    accent: "#3730A3",
    glow: "#FFFFFF",
    text: "#2A2638",
  },
} as const;

type ScenePaletteKey = keyof typeof scenePalettes;

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function slugHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function initialsForName(name: string) {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "?";
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export function createAvatarDataUrl(
  name: string,
  paletteKey: ScenePaletteKey = "indigo",
) {
  const palette = scenePalettes[paletteKey];
  const initials = initialsForName(name);
  const hash = slugHash(name);
  const circleX = 48 + (hash % 28);
  const circleY = 30 + (hash % 18);
  const arcLift = 130 + (hash % 24);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="${escapeSvgText(name)}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.top}" />
          <stop offset="100%" stop-color="${palette.bottom}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.85" />
          <stop offset="100%" stop-color="${palette.glow}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="160" height="160" rx="40" fill="url(#bg)" />
      <circle cx="${circleX}" cy="${circleY}" r="54" fill="url(#glow)" opacity="0.7" />
      <path d="M0 ${arcLift}C28 114 52 102 82 102C116 102 138 116 160 144V160H0Z" fill="${palette.accent}" opacity="0.82" />
      <circle cx="80" cy="66" r="24" fill="${palette.glow}" opacity="0.96" />
      <path d="M38 144c10-24 31-36 42-36s32 12 42 36" fill="${palette.glow}" opacity="0.94" />
      <text x="80" y="147" text-anchor="middle" font-family="DM Sans, Arial, sans-serif" font-size="28" font-weight="700" fill="${palette.text}" letter-spacing="2">${escapeSvgText(initials)}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function createSceneCoverDataUrl(
  title: string,
  eyebrow: string,
  paletteKey: ScenePaletteKey = "indigo",
) {
  const palette = scenePalettes[paletteKey];
  const hash = slugHash(`${title}:${eyebrow}`);
  const glowX = 180 + (hash % 160);
  const glowY = 70 + (hash % 50);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" aria-label="${escapeSvgText(title)}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.top}" />
          <stop offset="100%" stop-color="${palette.bottom}" />
        </linearGradient>
        <radialGradient id="glow" cx="${glowX}" cy="${glowY}" r="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.88" />
          <stop offset="100%" stop-color="${palette.glow}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="720" fill="url(#bg)" />
      <circle cx="${glowX}" cy="${glowY}" r="280" fill="url(#glow)" />
      <circle cx="980" cy="160" r="220" fill="${palette.accent}" opacity="0.12" />
      <path d="M0 548C128 490 258 474 412 492C548 508 706 566 840 566C976 566 1086 512 1200 470V720H0Z" fill="${palette.accent}" opacity="0.22" />
      <path d="M0 604C148 566 282 550 446 566C618 584 742 650 914 650C1038 650 1128 620 1200 592V720H0Z" fill="${palette.glow}" opacity="0.2" />
      <rect x="86" y="86" width="164" height="36" rx="18" fill="rgba(255,255,255,0.16)" />
      <text x="168" y="109" text-anchor="middle" font-family="DM Sans, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="3" fill="${palette.text}" opacity="0.74">${escapeSvgText(eyebrow.toUpperCase())}</text>
      <text x="86" y="526" font-family="Fraunces, Georgia, serif" font-size="94" font-weight="600" fill="${palette.text}">${escapeSvgText(title)}</text>
      <text x="86" y="580" font-family="DM Sans, Arial, sans-serif" font-size="28" fill="${palette.text}" opacity="0.76">MeetupReykjavik visual cover</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function createImageBackground(
  imageUrl: string,
  overlayTop = "rgba(30,27,46,0.18)",
  overlayBottom = "rgba(30,27,46,0.62)",
) {
  return `linear-gradient(180deg, ${overlayTop}, ${overlayBottom}), url("${imageUrl}") center/cover no-repeat`;
}

export function createIllustratedBackground(
  title: string,
  eyebrow: string,
  paletteKey: ScenePaletteKey = "indigo",
) {
  return createImageBackground(
    createSceneCoverDataUrl(title, eyebrow, paletteKey),
    "rgba(30,27,46,0.04)",
    "rgba(30,27,46,0.42)",
  );
}
