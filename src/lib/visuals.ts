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
  _paletteKey: ScenePaletteKey = "indigo",
) {
  // Clean monogram avatar — dark basalt circle, sand-cream initials.
  const initials = initialsForName(name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="${escapeSvgText(name)}">
      <rect width="160" height="160" rx="80" fill="#2A2638" />
      <text x="80" y="98" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="62" font-weight="600" fill="#F5F0E8" letter-spacing="-1">${escapeSvgText(initials)}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function createSceneCoverDataUrl(
  title: string,
  eyebrow: string,
  _paletteKey: ScenePaletteKey = "indigo",
) {
  // Clean typographic placeholder — sand background, dark editorial wordmark.
  // No gradients, no blobs. Used when no real photo exists.
  const trimmed = title.length > 32 ? `${title.slice(0, 30)}…` : title;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" aria-label="${escapeSvgText(title)}">
      <rect width="1200" height="720" fill="#F5F0E8" />
      <line x1="86" y1="120" x2="146" y2="120" stroke="#2A2638" stroke-width="2" />
      <text x="160" y="127" font-family="DM Sans, Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="3" fill="#6E6A7A">${escapeSvgText(eyebrow.toUpperCase())}</text>
      <text x="86" y="430" font-family="Fraunces, Georgia, serif" font-size="84" font-weight="600" fill="#2A2638" letter-spacing="-2">${escapeSvgText(trimmed)}</text>
      <text x="86" y="640" font-family="DM Sans, Arial, sans-serif" font-size="16" font-weight="600" fill="#9994A8" letter-spacing="2">MEETUP REYKJAVÍK</text>
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
  // The clean placeholder is already low-contrast; skip the heavy dark overlay
  // so card text reads correctly without muddying the cover.
  return createImageBackground(
    createSceneCoverDataUrl(title, eyebrow, paletteKey),
    "rgba(30,27,46,0)",
    "rgba(30,27,46,0)",
  );
}
