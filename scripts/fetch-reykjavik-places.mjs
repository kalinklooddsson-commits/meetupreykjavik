import { createHash } from "node:crypto";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const USER_AGENT = "meetupreykjavik-seeder/0.1";
const ROOT = process.cwd();
const DATA_DIR = join(ROOT, "data", "external");
const IMAGE_DIR = join(ROOT, "public", "place-images", "reykjavik");
const GENERATED_IMAGE_DIR = join(IMAGE_DIR, "generated");
const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org/search?city=Reykjavik&country=Iceland&format=jsonv2&limit=1";
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const DOWNLOAD_IMAGES = process.env.DOWNLOAD_IMAGES !== "0";
const IMAGE_LIMIT = Number(process.env.IMAGE_LIMIT ?? "12");

const PLACE_RULES = [
  {
    test: (tags) => ["bar", "pub", "nightclub"].includes(tags.amenity ?? ""),
    laneKey: "social-nightlife",
    laneLabel: "Social & nightlife",
    kindLabel: (tags) =>
      tags.amenity === "nightclub" ? "Nightclub" : tags.amenity === "bar" ? "Bar" : "Pub",
    priority: 120,
  },
  {
    test: (tags) => ["restaurant", "cafe"].includes(tags.amenity ?? ""),
    laneKey: "food-and-drink",
    laneLabel: "Food & drink",
    kindLabel: (tags) => (tags.amenity === "cafe" ? "Cafe" : "Restaurant"),
    priority: 100,
  },
  {
    test: (tags) => tags.office === "coworking",
    laneKey: "coworking-learning",
    laneLabel: "Coworking & learning",
    kindLabel: () => "Coworking",
    priority: 98,
  },
  {
    test: (tags) => ["theatre", "cinema", "arts_centre"].includes(tags.amenity ?? ""),
    laneKey: "culture",
    laneLabel: "Culture & live arts",
    kindLabel: (tags) =>
      tags.amenity === "theatre"
        ? "Theatre"
        : tags.amenity === "cinema"
          ? "Cinema"
          : "Arts centre",
    priority: 96,
  },
  {
    test: (tags) => ["gallery", "museum", "attraction"].includes(tags.tourism ?? ""),
    laneKey: "culture",
    laneLabel: "Culture & live arts",
    kindLabel: (tags) =>
      tags.tourism === "gallery"
        ? "Gallery"
        : tags.tourism === "museum"
          ? "Museum"
          : "Attraction",
    priority: 94,
  },
  {
    test: (tags) => tags.tourism === "hostel",
    laneKey: "stays-social",
    laneLabel: "Stay & social",
    kindLabel: () => "Hostel",
    priority: 90,
  },
  {
    test: (tags) => ["sports_centre", "fitness_centre"].includes(tags.leisure ?? ""),
    laneKey: "fitness-outdoors",
    laneLabel: "Fitness & outdoors",
    kindLabel: (tags) =>
      tags.leisure === "sports_centre" ? "Sports centre" : "Fitness centre",
    priority: 84,
  },
  {
    test: (tags) => ["community_centre", "conference_centre", "library"].includes(tags.amenity ?? ""),
    laneKey: "community-learning",
    laneLabel: "Community & learning",
    kindLabel: (tags) => {
      if (tags.amenity === "community_centre") {
        return "Community centre";
      }

      if (tags.amenity === "conference_centre") {
        return "Conference centre";
      }

      return "Library";
    },
    priority: 80,
  },
  {
    test: (tags) => tags.shop === "books",
    laneKey: "culture",
    laneLabel: "Culture & live arts",
    kindLabel: () => "Bookshop",
    priority: 74,
  },
];

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function stripMarkup(value) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function csvEscape(value) {
  const stringValue = value == null ? "" : String(value);

  if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`;
  }

  return stringValue;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function imagePaletteForLane(laneKey) {
  if (laneKey === "social-nightlife") {
    return {
      background:
        "linear-gradient(135deg, rgba(30,27,46,0.98) 0%, rgba(79,70,229,0.92) 48%, rgba(232,97,77,0.86) 100%)",
      accent: "#F18D7E",
      chip: "#FDE8E4",
      chipText: "#B33D2C",
    };
  }

  if (laneKey === "food-and-drink") {
    return {
      background:
        "linear-gradient(135deg, rgba(42,38,56,0.96) 0%, rgba(232,97,77,0.88) 56%, rgba(245,240,232,0.94) 100%)",
      accent: "#F5F0E8",
      chip: "#FFF1EC",
      chipText: "#B33D2C",
    };
  }

  if (laneKey === "culture") {
    return {
      background:
        "linear-gradient(135deg, rgba(30,27,46,0.98) 0%, rgba(55,48,163,0.9) 46%, rgba(245,240,232,0.9) 100%)",
      accent: "#F5F0E8",
      chip: "#EDE9FE",
      chipText: "#3730A3",
    };
  }

  if (laneKey === "fitness-outdoors") {
    return {
      background:
        "linear-gradient(135deg, rgba(42,38,56,0.94) 0%, rgba(124,154,130,0.9) 52%, rgba(245,240,232,0.92) 100%)",
      accent: "#D4E4D7",
      chip: "#EAF4EC",
      chipText: "#2D5F3A",
    };
  }

  return {
    background:
      "linear-gradient(135deg, rgba(30,27,46,0.98) 0%, rgba(79,70,229,0.84) 42%, rgba(124,154,130,0.72) 100%)",
    accent: "#F5F0E8",
    chip: "#F5F0E8",
    chipText: "#2A2638",
  };
}

function buildFallbackCover(place) {
  const palette = imagePaletteForLane(place.laneKey);
  const label = escapeXml(place.laneLabel);
  const title = escapeXml(place.name);
  const area = escapeXml(place.area || "Reykjavik");
  const kind = escapeXml(place.kindLabel);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">${kind} cover for ${title} in ${area}</desc>
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1B2E" />
      <stop offset="45%" stop-color="#3730A3" />
      <stop offset="100%" stop-color="#E8614D" />
    </linearGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="26" />
    </filter>
  </defs>
  <rect width="1600" height="900" fill="${palette.background}" />
  <circle cx="1280" cy="180" r="180" fill="rgba(255,255,255,0.12)" filter="url(#blur)" />
  <circle cx="260" cy="700" r="230" fill="rgba(245,240,232,0.18)" filter="url(#blur)" />
  <circle cx="1120" cy="760" r="140" fill="rgba(232,97,77,0.2)" filter="url(#blur)" />
  <rect x="110" y="110" width="240" height="52" rx="26" fill="${palette.chip}" />
  <text x="230" y="143" text-anchor="middle" font-family="DM Sans, Arial, sans-serif" font-size="22" font-weight="700" fill="${palette.chipText}" letter-spacing="1.4">${label}</text>
  <text x="110" y="640" font-family="Fraunces, Georgia, serif" font-size="116" font-weight="600" fill="#FFFFFF" letter-spacing="-4">${title}</text>
  <text x="110" y="714" font-family="DM Sans, Arial, sans-serif" font-size="30" fill="rgba(255,255,255,0.82)">${kind} · ${area}</text>
  <text x="110" y="796" font-family="DM Sans, Arial, sans-serif" font-size="22" fill="${palette.accent}" letter-spacing="1.8">MEETUP REYKJAVIK VENUE SOURCEBOOK</text>
  <path d="M1170 620c66-54 144-81 234-81 0 62-16 119-48 171-32 52-73 95-124 128-37-54-58-115-62-183z" fill="rgba(245,240,232,0.16)" />
</svg>`;
}

function createFallbackImage(place) {
  const fileName = `${place.slug}.svg`;
  const filePath = join(GENERATED_IMAGE_DIR, fileName);

  if (!existsSync(filePath)) {
    writeFileSync(filePath, buildFallbackCover(place));
  }

  return `/place-images/reykjavik/generated/${fileName}`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "user-agent": USER_AGENT,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }

  return response.json();
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "user-agent": USER_AGENT,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }

  return response.text();
}

async function getCityBoundingBox() {
  const results = await fetchJson(NOMINATIM_URL);
  const [city] = results;

  if (!city?.boundingbox?.length) {
    throw new Error("Failed to geocode Reykjavik via Nominatim");
  }

  const [south, north, west, east] = city.boundingbox.map(Number);

  return {
    city: city.display_name ?? "Reykjavik",
    south,
    west,
    north,
    east,
  };
}

function buildOverpassQuery({ south, west, north, east }) {
  return `[out:json][timeout:90];
(
  nwr["amenity"~"^(bar|pub|restaurant|cafe|community_centre|arts_centre|library|theatre|cinema|nightclub|conference_centre)$"](${south},${west},${north},${east});
  nwr["tourism"~"^(gallery|museum|attraction|hostel)$"](${south},${west},${north},${east});
  nwr["leisure"~"^(sports_centre|fitness_centre)$"](${south},${west},${north},${east});
  nwr["office"="coworking"](${south},${west},${north},${east});
  nwr["shop"="books"](${south},${west},${north},${east});
);
out center tags;`;
}

async function fetchOverpassPlaces(bbox) {
  const query = buildOverpassQuery(bbox);
  let lastError;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const text = await fetchText(endpoint, {
        method: "POST",
        headers: {
          "content-type": "text/plain;charset=UTF-8",
        },
        body: query,
      });

      const payload = JSON.parse(text);
      return payload.elements ?? [];
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("All Overpass endpoints failed");
}

function classifyPlace(tags) {
  for (const rule of PLACE_RULES) {
    if (rule.test(tags)) {
      return {
        laneKey: rule.laneKey,
        laneLabel: rule.laneLabel,
        kindLabel: rule.kindLabel(tags),
        priority: rule.priority,
      };
    }
  }

  return {
    laneKey: "misc",
    laneLabel: "Miscellaneous",
    kindLabel: "Place",
    priority: 0,
  };
}

function formatArea(tags) {
  return (
    tags["addr:street"] ??
    tags.neighbourhood ??
    tags.suburb ??
    tags.district ??
    tags["addr:city"] ??
    "Reykjavik"
  );
}

function formatAddress(tags) {
  const primary = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  const secondary = [tags["addr:postcode"], tags["addr:city"]].filter(Boolean).join(" ");
  return [primary, secondary].filter(Boolean).join(", ");
}

function placeSummary(place) {
  const websiteSignal = place.website ? "Website listed." : "Website not listed yet.";
  const hoursSignal = place.openingHours ? "Hours listed." : "Hours not listed.";
  return `${place.kindLabel} in ${place.area}. ${websiteSignal} ${hoursSignal}`;
}

function normalizePlace(element) {
  const tags = element.tags ?? {};
  const name = tags.name ?? tags["name:en"];

  if (!name) {
    return null;
  }

  const { laneKey, laneLabel, kindLabel, priority } = classifyPlace(tags);
  const area = formatArea(tags);
  const address = formatAddress(tags);
  const lat = element.center?.lat ?? element.lat ?? null;
  const lon = element.center?.lon ?? element.lon ?? null;

  return {
    id: `${element.type}-${element.id}`,
    osmType: element.type,
    osmId: element.id,
    slug: slugify(name),
    name,
    laneKey,
    laneLabel,
    kindLabel,
    priority,
    area,
    address,
    summary: "",
    lat,
    lon,
    website: tags.website ?? tags["contact:website"] ?? "",
    phone: tags.phone ?? tags["contact:phone"] ?? "",
    email: tags.email ?? tags["contact:email"] ?? "",
    openingHours: tags.opening_hours ?? "",
    wheelchair: tags.wheelchair ?? "",
    wikidata: tags.wikidata ?? "",
    wikimediaCommons: tags.wikimedia_commons ?? "",
    rawKind:
      tags.amenity ?? tags.tourism ?? tags.leisure ?? tags.office ?? tags.shop ?? "",
    tags: {
      amenity: tags.amenity ?? "",
      tourism: tags.tourism ?? "",
      leisure: tags.leisure ?? "",
      office: tags.office ?? "",
      shop: tags.shop ?? "",
    },
    image: null,
  };
}

function dedupePlaces(places) {
  const seen = new Map();

  for (const place of places) {
    const key = `${slugify(place.name)}::${place.address || place.area}`;
    const existing = seen.get(key);

    if (!existing || place.priority > existing.priority || (place.website && !existing.website)) {
      seen.set(key, place);
    }
  }

  return [...seen.values()]
    .sort((left, right) => {
      if (right.priority !== left.priority) {
        return right.priority - left.priority;
      }

      return left.name.localeCompare(right.name);
    })
    .map((place) => ({
      ...place,
      summary: placeSummary(place),
    }));
}

function ensureUniqueSlugs(places) {
  const groups = new Map();

  for (const place of places) {
    const group = groups.get(place.slug) ?? [];
    group.push(place);
    groups.set(place.slug, group);
  }

  return [...groups.entries()].flatMap(([baseSlug, group]) => {
    if (group.length === 1) {
      return group;
    }

    const ranked = [...group].sort((left, right) => {
      const leftScore =
        (left.address ? 2 : 0) + (left.website ? 1 : 0) + left.priority;
      const rightScore =
        (right.address ? 2 : 0) + (right.website ? 1 : 0) + right.priority;

      return rightScore - leftScore;
    });
    const seen = new Set();

    return ranked.map((place, index) => {
      if (index === 0) {
        seen.add(baseSlug);
        return place;
      }

      const suffixSource =
        place.address || place.area || place.rawKind || `${index + 1}`;
      let candidate = `${baseSlug}-${slugify(suffixSource)}`;
      let attempt = 2;

      while (!candidate || seen.has(candidate)) {
        candidate = `${baseSlug}-${slugify(suffixSource)}-${attempt}`;
        attempt += 1;
      }

      seen.add(candidate);
      return {
        ...place,
        slug: candidate,
      };
    });
  });
}

function readJsonCache(pathname) {
  if (!existsSync(pathname)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(pathname, "utf8"));
  } catch {
    return null;
  }
}

async function getImageTitleFromWikidata(qid, wikidataCache) {
  if (!qid) {
    return "";
  }

  if (wikidataCache[qid]) {
    return wikidataCache[qid];
  }

  const entity = await fetchJson(
    `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`,
  );
  const claims = entity?.entities?.[qid]?.claims ?? {};
  const title = claims?.P18?.[0]?.mainsnak?.datavalue?.value ?? "";

  wikidataCache[qid] = title;
  return title;
}

async function getCommonsMetadata(fileTitle, commonsCache) {
  if (!fileTitle) {
    return null;
  }

  const normalizedTitle = fileTitle.startsWith("File:")
    ? fileTitle
    : `File:${fileTitle}`;

  if (commonsCache[normalizedTitle]) {
    return commonsCache[normalizedTitle];
  }

  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
    `&titles=${encodeURIComponent(normalizedTitle)}` +
    "&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1600";
  const payload = await fetchJson(url);
  const page = Object.values(payload?.query?.pages ?? {})[0];
  const imageInfo = page?.imageinfo?.[0];

  if (!imageInfo) {
    commonsCache[normalizedTitle] = null;
    return null;
  }

  const metadata = imageInfo.extmetadata ?? {};
  const result = {
    title: normalizedTitle,
    sourceUrl: imageInfo.descriptionurl ?? imageInfo.url ?? "",
    originalUrl: imageInfo.url ?? "",
    thumbnailUrl: imageInfo.thumburl ?? imageInfo.url ?? "",
    license: stripMarkup(metadata.LicenseShortName?.value ?? metadata.License?.value ?? ""),
    credit: stripMarkup(
      metadata.Credit?.value ?? metadata.Artist?.value ?? metadata.Attribution?.value ?? "",
    ),
  };

  commonsCache[normalizedTitle] = result;
  return result;
}

async function downloadImage(image, slug) {
  if (!DOWNLOAD_IMAGES || !image?.thumbnailUrl) {
    return "";
  }

  const hash = createHash("sha1").update(image.thumbnailUrl).digest("hex").slice(0, 8);
  const extension = extname(new URL(image.thumbnailUrl).pathname) || ".jpg";
  const fileName = `${slug}-${hash}${extension}`;
  const filePath = join(IMAGE_DIR, fileName);

  if (!existsSync(filePath)) {
    const response = await fetch(image.thumbnailUrl, {
      headers: {
        "user-agent": USER_AGENT,
      },
    });

    if (!response.ok) {
      return "";
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(filePath, buffer);
  }

  return `/place-images/reykjavik/${fileName}`;
}

async function enrichPlacesWithImages(places) {
  const wikidataCache = {};
  const commonsCache =
    readJsonCache(join(DATA_DIR, ".cache-commons.json")) ?? {};
  const imageCandidates = [];
  let downloadedImages = 0;

  let imageSlotsRemaining = IMAGE_LIMIT;

  for (const place of places) {
    const commonsTag = place.wikimediaCommons;
    const wikidataTitle = place.wikidata
      ? await getImageTitleFromWikidata(place.wikidata, wikidataCache)
      : "";
    const fileTitle =
      commonsTag && commonsTag.startsWith("File:")
        ? commonsTag
        : wikidataTitle;

    if (!fileTitle) {
      continue;
    }

    const metadata = await getCommonsMetadata(fileTitle, commonsCache);

    if (!metadata) {
      continue;
    }

    const image = {
      kind: "photo",
      localPath: "",
      remoteUrl: metadata.thumbnailUrl ?? "",
      license: metadata.license || "See source",
      sourceUrl: metadata.sourceUrl,
      credit: metadata.credit || "Wikimedia Commons",
    };

    if (imageSlotsRemaining > 0) {
      const localPath = await downloadImage(metadata, place.slug);

      if (localPath) {
        image.localPath = localPath;
        downloadedImages += 1;
        imageSlotsRemaining -= 1;
      }
    }

    place.image = image;
    imageCandidates.push({
      placeSlug: place.slug,
      placeName: place.name,
      laneLabel: place.laneLabel,
      title: metadata.title,
      sourceUrl: metadata.sourceUrl,
      thumbnailUrl: metadata.thumbnailUrl,
      license: image.license,
      credit: image.credit,
      localPath: image.localPath,
    });
  }

  writeFileSync(
    join(DATA_DIR, ".cache-commons.json"),
    JSON.stringify(commonsCache, null, 2),
  );

  return {
    places,
    imageCandidates,
    downloadedImages,
  };
}

function attachFallbackImages(places) {
  let generatedCovers = 0;

  for (const place of places) {
    if (place.image?.localPath || place.image?.remoteUrl) {
      continue;
    }

    place.image = {
      kind: "generated",
      localPath: createFallbackImage(place),
      remoteUrl: "",
      license: "",
      sourceUrl: "",
      credit: "",
    };
    generatedCovers += 1;
  }

  return generatedCovers;
}

function toCsv(rows) {
  const headers = [
    "name",
    "lane",
    "kind",
    "area",
    "address",
    "website",
    "lat",
    "lon",
    "wikidata",
    "image_kind",
    "image_license",
    "image_local_path",
    "image_remote_url",
  ];

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.name,
        row.laneLabel,
        row.kindLabel,
        row.area,
        row.address,
        row.website,
        row.lat,
        row.lon,
        row.wikidata,
        row.image?.kind ?? "",
        row.image?.license ?? "",
        row.image?.localPath ?? "",
        row.image?.remoteUrl ?? "",
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];

  return `${lines.join("\n")}\n`;
}

function buildReport(
  { city, south, west, north, east },
  places,
  imageCandidates,
  downloadedImages,
  generatedCovers,
) {
  const lanes = [...new Map(places.map((place) => [place.laneKey, place.laneLabel])).entries()]
    .map(([key, label]) => ({
      key,
      label,
      count: places.filter((place) => place.laneKey === key).length,
    }))
    .sort((left, right) => right.count - left.count);

  const featuredPlaces = places
    .filter((place) => place.image)
    .sort((left, right) => {
      if ((left.image?.kind ?? "") !== (right.image?.kind ?? "")) {
        return left.image?.kind === "photo" ? -1 : 1;
      }

      return right.priority - left.priority;
    })
    .slice(0, 6)
    .map((place) => ({
      slug: place.slug,
      name: place.name,
      laneKey: place.laneKey,
      laneLabel: place.laneLabel,
      kindLabel: place.kindLabel,
      area: place.area,
      address: place.address,
      website: place.website,
      summary: place.summary,
      image: place.image,
    }));

  return {
    generatedAt: new Date().toISOString(),
    city,
    bbox: { south, west, north, east },
    counts: {
      totalPlaces: places.length,
      withWebsite: places.filter((place) => place.website).length,
      withAddress: places.filter((place) => place.address).length,
      withWikidata: places.filter((place) => place.wikidata).length,
      imageCandidates: imageCandidates.length,
      downloadedImages,
      generatedCovers,
    },
    lanes,
    featuredPlaces,
  };
}

async function main() {
  ensureDir(DATA_DIR);
  ensureDir(IMAGE_DIR);
  ensureDir(GENERATED_IMAGE_DIR);

  const bbox = await getCityBoundingBox();
  const rawPlaces = await fetchOverpassPlaces(bbox);
  const normalized = rawPlaces.map(normalizePlace).filter(Boolean);
  const deduped = ensureUniqueSlugs(dedupePlaces(normalized));
  const { places, imageCandidates, downloadedImages } =
    await enrichPlacesWithImages(deduped);
  const generatedCovers = attachFallbackImages(places);
  const report = buildReport(
    bbox,
    places,
    imageCandidates,
    downloadedImages,
    generatedCovers,
  );

  writeFileSync(
    join(DATA_DIR, "reykjavik-places.json"),
    JSON.stringify(places, null, 2),
  );
  writeFileSync(
    join(DATA_DIR, "reykjavik-image-candidates.json"),
    JSON.stringify(imageCandidates, null, 2),
  );
  writeFileSync(
    join(DATA_DIR, "reykjavik-source-report.json"),
    JSON.stringify(report, null, 2),
  );
  writeFileSync(join(DATA_DIR, "reykjavik-places.csv"), toCsv(places));

  console.log(
    JSON.stringify(
      {
        generatedAt: report.generatedAt,
        totalPlaces: report.counts.totalPlaces,
        imageCandidates: report.counts.imageCandidates,
        downloadedImages: report.counts.downloadedImages,
        generatedCovers: report.counts.generatedCovers,
        topLanes: report.lanes.slice(0, 5),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
