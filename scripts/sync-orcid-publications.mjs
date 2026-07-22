import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const dataDir = path.join(repoRoot, "data");
const configPath = path.join(dataDir, "orcid.json");
const publicationsPath = path.join(dataDir, "publications.json");

function normalizeOrcidId(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\/orcid\.org\//i, "")
    .replace(/\/+$/, "");
}

function normalizeDoi(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .toLowerCase();
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function toTitleCase(value) {
  return String(value || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mapWorkType(orcidType) {
  const mapping = {
    "journal-article": "Journal",
    "conference-paper": "Conference",
    "conference-abstract": "Conference",
    preprint: "Preprint",
    book: "Book",
    "book-chapter": "Book Chapter",
    dissertation: "Thesis",
    report: "Report",
    dataset: "Dataset",
    software: "Software",
    "working-paper": "Working Paper"
  };

  return mapping[orcidType] || toTitleCase(orcidType || "Publication");
}

function buildVenue(detail) {
  const parts = [];
  const journalTitle = detail?.["journal-title"]?.value;
  const type = mapWorkType(detail?.type);
  const year = detail?.["publication-date"]?.year?.value;

  if (journalTitle) {
    parts.push(journalTitle);
  } else if (type) {
    parts.push(type);
  }

  if (year) {
    parts.push(`${year}.`);
  }

  return parts.join(", ");
}

function extractExternalIds(detail) {
  const ids = detail?.["external-ids"]?.["external-id"];
  return Array.isArray(ids) ? ids : [];
}

function extractDoi(detail) {
  const doiId = extractExternalIds(detail).find((item) =>
    String(item?.["external-id-type"] || "").toLowerCase() === "doi"
  );

  const raw = doiId?.["external-id-value"];
  return raw ? normalizeDoi(raw) : "";
}

function extractLinks(detail) {
  const links = [];
  const doi = extractDoi(detail);
  const url = detail?.url?.value;

  if (doi) {
    links.push({
      label: "Paper",
      url: `https://doi.org/${doi}`
    });
  } else if (url) {
    links.push({
      label: "Paper",
      url
    });
  }

  for (const externalId of extractExternalIds(detail)) {
    const type = String(externalId?.["external-id-type"] || "").toLowerCase();
    const value = externalId?.["external-id-value"];
    const urlValue = externalId?.["external-id-url"]?.value;
    const relation = String(externalId?.["external-id-relationship"] || "").toLowerCase();

    if (!urlValue || relation !== "self") {
      continue;
    }

    if (type === "doi" || type === "source-work-id") {
      continue;
    }

    const label =
      type === "arxiv" ? "Preprint" :
      type === "isbn" ? "ISBN" :
      type === "issn" ? "ISSN" :
      value ? `${toTitleCase(type)}: ${value}` : toTitleCase(type);

    links.push({ label, url: urlValue });
  }

  return dedupeLinks(links);
}

function dedupeLinks(links) {
  const seen = new Set();
  const output = [];

  for (const link of links || []) {
    if (!link?.url) continue;
    const key = `${String(link.label || "").toLowerCase()}|${String(link.url).toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push({
      label: link.label || "Link",
      url: link.url
    });
  }

  return output;
}

function extractAuthors(detail) {
  const contributors = detail?.contributors?.contributor;
  if (!Array.isArray(contributors) || contributors.length === 0) {
    return "";
  }

  const names = contributors
    .map((contributor) => contributor?.["credit-name"]?.value?.trim())
    .filter(Boolean);

  return names.join(", ");
}

function buildStableId({ doi, title, year, putCode }) {
  if (doi) {
    return slugify(doi.replace(/\//g, "-"));
  }

  if (title && year) {
    return slugify(`${title}-${year}`);
  }

  return `orcid-${putCode}`;
}

function mergePublication(existing, generated) {
  const mergedLinks = dedupeLinks([
    ...(generated.links || []),
    ...(existing?.links || [])
  ]);

  return {
    id: existing?.id || generated.id,
    source: "orcid",
    orcidPutCode: generated.orcidPutCode,
    doi: generated.doi || existing?.doi || "",
    selected: existing?.selected ?? false,
    field: existing?.field ?? "",
    year: generated.year || existing?.year || "",
    type: generated.type || existing?.type || "Publication",
    title: generated.title || existing?.title || "",
    authors: generated.authors || existing?.authors || "",
    venue: generated.venue || existing?.venue || "",
    links: mergedLinks
  };
}

async function readJson(filePath, fallback) {
  try {
    const text = await fs.readFile(filePath, "utf8");
    return JSON.parse(text);
  } catch (error) {
    if (error.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "longtanle-github-io-orcid-sync"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchOrcidWorks(orcidId) {
  const baseUrl = `https://pub.orcid.org/v3.0/${orcidId}`;
  const works = await fetchJson(`${baseUrl}/works`);
  const groups = Array.isArray(works?.group) ? works.group : [];
  const summaries = groups.flatMap((group) => group?.["work-summary"] || []);

  const details = [];

  for (const summary of summaries) {
    const putCode = summary?.["put-code"];
    if (!putCode) continue;
    const detail = await fetchJson(`${baseUrl}/work/${putCode}`);
    details.push(detail);
  }

  return details;
}

function createLookup(publications) {
  const byDoi = new Map();
  const byTitleYear = new Map();

  for (const item of publications) {
    const doi = normalizeDoi(item?.doi);
    const title = String(item?.title || "").trim().toLowerCase();
    const year = String(item?.year || "").trim();

    if (doi) {
      byDoi.set(doi, item);
    }

    if (title && year) {
      byTitleYear.set(`${title}|${year}`, item);
    }
  }

  return { byDoi, byTitleYear };
}

function sortPublications(items) {
  return items.slice().sort((a, b) => {
    const yearDiff = Number(b.year || 0) - Number(a.year || 0);
    if (yearDiff !== 0) return yearDiff;
    return String(a.title || "").localeCompare(String(b.title || ""));
  });
}

async function main() {
  const config = await readJson(configPath, {});
  const publications = await readJson(publicationsPath, []);
  const orcidId = normalizeOrcidId(process.env.ORCID_ID || config.orcidId);

  if (!orcidId) {
    throw new Error(`Missing ORCID ID. Set ORCID_ID or add it to ${path.relative(repoRoot, configPath)}.`);
  }

  const existingLookup = createLookup(publications);
  const fetchedWorks = await fetchOrcidWorks(orcidId);

  const nextPublications = fetchedWorks.map((detail) => {
    const title = detail?.title?.title?.value?.trim() || "";
    const year = detail?.["publication-date"]?.year?.value || "";
    const doi = extractDoi(detail);
    const key = `${title.toLowerCase()}|${year}`;
    const existing =
      (doi && existingLookup.byDoi.get(doi)) ||
      existingLookup.byTitleYear.get(key);

    const generated = {
      id: buildStableId({
        doi,
        title,
        year,
        putCode: detail?.["put-code"]
      }),
      orcidPutCode: detail?.["put-code"],
      doi,
      year: year ? Number(year) : "",
      type: mapWorkType(detail?.type),
      title,
      authors: extractAuthors(detail),
      venue: buildVenue(detail),
      links: extractLinks(detail)
    };

    return mergePublication(existing, generated);
  });

  await fs.writeFile(
    publicationsPath,
    JSON.stringify(sortPublications(nextPublications), null, 2) + "\n",
    "utf8"
  );

  console.log(`Synced ${nextPublications.length} ORCID works for ${orcidId}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
