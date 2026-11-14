import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist", "nasa-snapshot.json");
const spec = JSON.parse(await readFile(resolve(root, "..", "..", "api-1.json"), "utf8"));
const fallback = JSON.parse(await readFile(output, "utf8"));
const server = spec.servers?.[0]?.url || "https://ccmc.gsfc.nasa.gov/DONKI-API";
const requiredRoutes = ["/get/FLR", "/get/SEP", "/get/CME"];
for (const route of requiredRoutes) {
  if (!spec.paths?.[route]?.get) throw new Error(`Local api-1.json does not define ${route}`);
}

const today = new Date();
const start = new Date(today.getTime() - 30 * 86400000);
const iso = value => value.toISOString().slice(0, 10);
const query = `startDate=${iso(start)}&endDate=${iso(today)}`;

async function json(url, timeout = 30000) {
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

async function donki(type) {
  try {
    const result = await json(`${server}/get/${type}?${query}`);
    if (!Array.isArray(result)) throw new Error(`${type}: expected an array`);
    return result;
  } catch (primaryError) {
    const key = process.env.NASA_API_KEY;
    if (!key) throw primaryError;
    const legacy = await json(`https://api.nasa.gov/DONKI/${type}?${query}&api_key=${encodeURIComponent(key)}`);
    if (!Array.isArray(legacy)) throw new Error(`${type}: legacy NASA Open API returned an unexpected response`);
    return legacy;
  }
}

function radlabRow(payload) {
  const row = payload?.data?.[0];
  if (!row || !Array.isArray(payload.columns)) return null;
  return Object.fromEntries(payload.columns.map((column, index) => [column, row[index]]));
}

function osdrStudies(payload, term) {
  return (payload?.hits?.hits || []).slice(0, 2).map(hit => ({
    term,
    accession: hit._source?.Accession || hit._id,
    title: hit._source?.["Study Title"] || hit._source?.["Project Title"] || "NASA OSDR study"
  }));
}

const updated = { ...fallback, generatedAt: new Date().toISOString(), mode: "archived-build-snapshot" };
const results = await Promise.allSettled([
  Promise.all([donki("FLR"), donki("SEP"), donki("CME")]),
  json("https://visualization.osdr.nasa.gov/radlab/api/?spacecraft=ISS&instrument=DosTel&timestamp%3E=2022-04-01T23%3A00&timestamp%3C2022-04-02T01%3A05&absorbed_dose_rate%3E2&format=json"),
  Promise.all([
    ["OSD-767", "plant stress"],
    ["OSD-655", "space crops"],
    ["OSD-977", "bone health"]
  ].map(async ([accession, term]) => osdrStudies(await json(`https://osdr.nasa.gov/osdr/data/search?term=${encodeURIComponent(accession)}`), term)))
]);

if (results[0].status === "fulfilled") {
  const [flares, seps, cmes] = results[0].value;
  updated.donki = {
    flare: flares.at(-1) || null,
    sep: seps.at(-1) || null,
    cme: cmes.at(-1) || null,
    source: server,
    note: "Research records seed a training scenario; they are not an operational Mars forecast."
  };
} else {
  console.warn(`DONKI refresh unavailable; preserving fallback. ${results[0].reason.message}`);
}

if (results[1].status === "fulfilled") {
  updated.radlab = {
    ...fallback.radlab,
    sample: radlabRow(results[1].value),
    sourceUrl: "https://visualization.osdr.nasa.gov/radlab/gui/data-api/"
  };
} else {
  console.warn(`RadLab refresh unavailable; preserving fallback. ${results[1].reason.message}`);
}

if (results[2].status === "fulfilled") {
  updated.osdr = {
    ...fallback.osdr,
    studies: results[2].value.flat(),
    supportingRecord: {
      id: "OS-566",
      title: "NASA Ames bed-rest studies including sleep and circadian rhythms",
      url: "https://osdr.nasa.gov/bio/repo/data/experiments/OS-566"
    },
    sourceUrl: "https://osdr.nasa.gov/osdr/data/search"
  };
} else {
  console.warn(`OSDR refresh unavailable; preserving fallback. ${results[2].reason.message}`);
}

await writeFile(output, JSON.stringify(updated, null, 2) + "\n");
console.log(`NASA training snapshot written to ${output}`);
