# Data Sourcing

This repo now includes a local Reykjavik place and image sourcing pipeline.

## Command

```bash
npm run fetch:places
```

## What it does

- geocodes Reykjavik through OpenStreetMap Nominatim
- fetches venue and community place candidates from Overpass
- normalizes them into seed-friendly JSON and CSV
- enriches places with Wikimedia image metadata when a place exposes `wikidata` or `wikimedia_commons`
- downloads local Commons thumbnails for a small featured set and records license and credit data

## Outputs

- `data/external/reykjavik-places.json`
- `data/external/reykjavik-places.csv`
- `data/external/reykjavik-image-candidates.json`
- `data/external/reykjavik-source-report.json`
- `public/place-images/reykjavik/*`

## Source policy

- place records come from OpenStreetMap via Nominatim and Overpass
- image candidates come from Wikimedia Commons and Wikidata only
- every downloaded image keeps source URL, license, and credit metadata in the generated report

## Notes

- this is a sourcing pipeline, not a final production sync job
- some nightlife and small-business venues will not have open-license image matches yet
- Commons images still require attribution and license compliance before production use
