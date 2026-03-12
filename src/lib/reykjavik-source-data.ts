import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type SourcedPlaceImage = {
  kind?: "photo" | "generated";
  localPath: string;
  remoteUrl?: string;
  license: string;
  sourceUrl: string;
  credit: string;
};

export type SourcedPlace = {
  slug: string;
  name: string;
  laneKey: string;
  laneLabel: string;
  kindLabel: string;
  area: string;
  address: string;
  website?: string;
  summary: string;
  image?: SourcedPlaceImage;
  latitude?: number;
  longitude?: number;
};

export type ReykjavikSourceReport = {
  generatedAt: string;
  city: string;
  counts: {
    totalPlaces: number;
    withWebsite: number;
    withAddress: number;
    withWikidata: number;
    imageCandidates: number;
    downloadedImages: number;
    generatedCovers: number;
  };
  lanes: Array<{
    key: string;
    label: string;
    count: number;
  }>;
  featuredPlaces: SourcedPlace[];
};

const defaultReport: ReykjavikSourceReport = {
  generatedAt: "",
  city: "Reykjavik",
  counts: {
    totalPlaces: 0,
    withWebsite: 0,
    withAddress: 0,
    withWikidata: 0,
    imageCandidates: 0,
    downloadedImages: 0,
    generatedCovers: 0,
  },
  lanes: [],
  featuredPlaces: [],
};

let cachedReport: ReykjavikSourceReport | null = null;
let cachedPlaces: SourcedPlace[] | null = null;

export function getReykjavikSourceReport(): ReykjavikSourceReport {
  if (cachedReport) {
    return cachedReport;
  }

  const reportPath = join(
    process.cwd(),
    "data",
    "external",
    "reykjavik-source-report.json",
  );

  if (!existsSync(reportPath)) {
    cachedReport = defaultReport;
    return cachedReport;
  }

  try {
    const report = JSON.parse(
      readFileSync(reportPath, "utf8"),
    ) as ReykjavikSourceReport;

    cachedReport = {
      ...defaultReport,
      ...report,
      counts: {
        ...defaultReport.counts,
        ...report.counts,
      },
      lanes: Array.isArray(report.lanes) ? report.lanes : [],
      featuredPlaces: Array.isArray(report.featuredPlaces)
        ? report.featuredPlaces
        : [],
    };
  } catch {
    cachedReport = defaultReport;
  }

  return cachedReport;
}

export function getFeaturedSourcedPlaces(limit = 6): SourcedPlace[] {
  return getReykjavikSourceReport().featuredPlaces.slice(0, limit);
}

export function getSourcedPlaces(): SourcedPlace[] {
  if (cachedPlaces) {
    return cachedPlaces;
  }

  const placesPath = join(
    process.cwd(),
    "data",
    "external",
    "reykjavik-places.json",
  );

  if (!existsSync(placesPath)) {
    cachedPlaces = [];
    return cachedPlaces;
  }

  try {
    const places = JSON.parse(readFileSync(placesPath, "utf8")) as SourcedPlace[];
    cachedPlaces = Array.isArray(places) ? places : [];
  } catch {
    cachedPlaces = [];
  }

  return cachedPlaces;
}

export function getSourcedPlaceBySlug(slug: string): SourcedPlace | undefined {
  return getSourcedPlaces().find((place) => place.slug === slug);
}
