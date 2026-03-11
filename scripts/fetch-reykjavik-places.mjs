import { createHash } from "node:crypto";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const USER_AGENT = "meetupreykjavik-seeder/0.1";
const ROOT = process.cwd();
const DATA_DIR = join(ROOT, "data", "external");
const IMAGE_DIR = join(ROOT, "public", "place-images", "reykjavik");
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
      localPath: "",
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
    "image_license",
    "image_local_path",
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
        row.image?.license ?? "",
        row.image?.localPath ?? "",
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];

  return `${lines.join("\n")}\n`;
}

function buildReport({ city, south, west, north, east }, places, imageCandidates, downloadedImages) {
  const lanes = [...new Map(places.map((place) => [place.laneKey, place.laneLabel])).entries()]
    .map(([key, label]) => ({
      key,
      label,
      count: places.filter((place) => place.laneKey === key).length,
    }))
    .sort((left, right) => right.count - left.count);

  const featuredPlaces = places
    .filter((place) => place.image?.localPath)
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
    },
    lanes,
    featuredPlaces,
  };
}

async function main() {
  ensureDir(DATA_DIR);
  ensureDir(IMAGE_DIR);

  const bbox = await getCityBoundingBox();
  const rawPlaces = await fetchOverpassPlaces(bbox);
  const normalized = rawPlaces.map(normalizePlace).filter(Boolean);
  const deduped = dedupePlaces(normalized);
  const { places, imageCandidates, downloadedImages } =
    await enrichPlacesWithImages(deduped);
  const report = buildReport(bbox, places, imageCandidates, downloadedImages);

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
