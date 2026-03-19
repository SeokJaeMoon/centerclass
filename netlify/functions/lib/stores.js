import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getStore } from "@netlify/blobs";
import { applicationSamples, instructorSamples, lectureSamples } from "./sample-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localDataDir = path.resolve(__dirname, "../../data");
const seedMarkerKey = "__seed_marker__";

const stores = {
  lectures: {
    blobName: "lectures-store",
    fileName: "lectures.json"
  },
  instructors: {
    blobName: "instructors-store",
    fileName: "instructors.json"
  },
  applications: {
    blobName: "applications-store",
    fileName: "applications.json"
  }
};

function shouldForceLocal() {
  return process.env.USE_LOCAL_BLOBS === "true";
}

async function ensureLocalFile(fileName) {
  await mkdir(localDataDir, { recursive: true });
  const filePath = path.join(localDataDir, fileName);

  try {
    await readFile(filePath, "utf-8");
  } catch {
    await writeFile(filePath, JSON.stringify({ items: {} }, null, 2), "utf-8");
  }

  return filePath;
}

async function readLocalStore(storeType) {
  const filePath = await ensureLocalFile(stores[storeType].fileName);
  const raw = await readFile(filePath, "utf-8");

  try {
    const parsed = JSON.parse(raw);
    return {
      filePath,
      payload: parsed?.items ? parsed : { items: {} }
    };
  } catch {
    return {
      filePath,
      payload: { items: {} }
    };
  }
}

async function writeLocalStore(storeType, items) {
  const filePath = await ensureLocalFile(stores[storeType].fileName);
  await writeFile(filePath, JSON.stringify({ items }, null, 2), "utf-8");
}

async function resolveStore(storeType) {
  if (shouldForceLocal()) {
    return {
      type: "local"
    };
  }

  try {
    const store = getStore({ name: stores[storeType].blobName });
    await store.list({ limit: 1 });
    return {
      type: "blobs",
      store
    };
  } catch {
    return {
      type: "local"
    };
  }
}

export async function listRecords(storeType) {
  const adapter = await resolveStore(storeType);

  if (adapter.type === "blobs") {
    const result = await adapter.store.list();
    const records = await Promise.all(
      (result.blobs || [])
        .filter((blob) => blob.key !== seedMarkerKey)
        .map(async (blob) => adapter.store.get(blob.key, { type: "json" }))
    );

    return records.filter(Boolean);
  }

  const { payload } = await readLocalStore(storeType);
  return Object.entries(payload.items)
    .filter(([key]) => key !== seedMarkerKey)
    .map(([, value]) => value);
}

export async function getRecord(storeType, id) {
  const adapter = await resolveStore(storeType);

  if (adapter.type === "blobs") {
    return adapter.store.get(id, { type: "json" });
  }

  const { payload } = await readLocalStore(storeType);
  return payload.items[id] || null;
}

export async function putRecord(storeType, id, value) {
  const adapter = await resolveStore(storeType);

  if (adapter.type === "blobs") {
    await adapter.store.setJSON(id, value);
    return value;
  }

  const { payload } = await readLocalStore(storeType);
  payload.items[id] = value;
  await writeLocalStore(storeType, payload.items);
  return value;
}

export async function deleteRecord(storeType, id) {
  const adapter = await resolveStore(storeType);

  if (adapter.type === "blobs") {
    await adapter.store.delete(id);
    return;
  }

  const { payload } = await readLocalStore(storeType);
  delete payload.items[id];
  await writeLocalStore(storeType, payload.items);
}

export async function replaceAllRecords(storeType, records) {
  const adapter = await resolveStore(storeType);

  if (adapter.type === "blobs") {
    const result = await adapter.store.list();
    await Promise.all((result.blobs || []).map((blob) => adapter.store.delete(blob.key)));
    await Promise.all(records.map((record) => adapter.store.setJSON(record.id, record)));
    return records;
  }

  const nextItems = Object.fromEntries(records.map((record) => [record.id, record]));
  await writeLocalStore(storeType, nextItems);
  return records;
}

export function createId(prefix) {
  return `${prefix}-${randomUUID()}`;
}

export async function setSeedMarker() {
  const marker = {
    id: seedMarkerKey,
    seededAt: new Date().toISOString()
  };

  await putRecord("lectures", seedMarkerKey, marker);
}

export async function getSeedMarker() {
  return getRecord("lectures", seedMarkerKey);
}

export async function seedSampleData(force = false) {
  const marker = await getSeedMarker();
  const [lectures, instructors, applications] = await Promise.all([
    listRecords("lectures"),
    listRecords("instructors"),
    listRecords("applications")
  ]);

  const hasExistingData = lectures.length > 0 || instructors.length > 0 || applications.length > 0;
  if (!force && (marker || hasExistingData)) {
    return {
      seeded: false,
      reason: "existing-data"
    };
  }

  await Promise.all([
    replaceAllRecords("lectures", lectureSamples),
    replaceAllRecords("instructors", instructorSamples),
    replaceAllRecords("applications", applicationSamples)
  ]);
  await setSeedMarker();

  return {
    seeded: true,
    counts: {
      lectures: lectureSamples.length,
      instructors: instructorSamples.length,
      applications: applicationSamples.length
    }
  };
}

export async function ensureSeedData() {
  return seedSampleData(false);
}
