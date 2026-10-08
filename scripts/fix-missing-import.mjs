import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataDir = path.join(root, "migration-data");

for (const line of readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#") || !t.includes("=")) continue;
  const i = t.indexOf("=");
  const k = t.slice(0, i).trim();
  const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  if (!(k in process.env)) process.env[k] = v;
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function loadJson(name) {
  return JSON.parse(readFileSync(path.join(dataDir, `${name}.json`), "utf8"));
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function withRetry(fn, label, attempts = 5) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      console.log(`retry ${label} (${i + 1}/${attempts}): ${e.message}`);
      await sleep(1000 * (i + 1));
    }
  }
  throw last;
}

// Keep admin login working as requested earlier
const { data: listed } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
const adminUser = listed?.users?.find((u) => u.email?.toLowerCase() === "procedcontab@gmail.com");
if (adminUser) {
  await supabase.from("profiles").update({ role: "admin", display_name: "Administrador", full_name: "Administrador" }).eq("id", adminUser.id);
  console.log("admin role restored for procedcontab@gmail.com");
}

const users = loadJson("User");
const userIdMap = new Map();
for (const u of users) {
  const existing = listed?.users?.find((x) => x.email?.toLowerCase() === u.email?.toLowerCase());
  if (existing) userIdMap.set(u.id, existing.id);
}

const { data: existingClients } = await supabase.from("clients").select("id,legacy_id");
const clientIdMap = new Map((existingClients || []).map((c) => [c.legacy_id, c.id]));

const clients = loadJson("Client");
for (const c of clients) {
  if (clientIdMap.has(c.id)) {
    console.log("client already present:", c.name);
    continue;
  }
  const row = {
    legacy_id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone || null,
    cpf_cnpj: c.cpf_cnpj,
    company_name: c.company_name || null,
    company_type: c.company_type || null,
    status: c.status || "Pendente",
    address: c.address || null,
    notes: c.notes || null,
    user_id: c.user_id ? userIdMap.get(c.user_id) || null : null,
    access_password: c.access_password || null,
    created_at: c.created_date || null,
    updated_at: c.updated_date || null,
  };
  const inserted = await withRetry(async () => {
    const { data, error } = await supabase.from("clients").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    return data;
  }, `client ${c.name}`);
  clientIdMap.set(c.id, inserted.id);
  console.log("inserted client", c.name, inserted.id);
}

const { data: existingFolders } = await supabase.from("document_folders").select("id,legacy_id");
const folderIdMap = new Map((existingFolders || []).map((f) => [f.legacy_id, f.id]));
const folders = loadJson("DocumentFolder");
for (const f of folders) {
  if (folderIdMap.has(f.id)) continue;
  const clientId = f.client_id ? clientIdMap.get(f.client_id) : null;
  if (!clientId) continue;
  const { data, error } = await supabase.from("document_folders").insert({
    legacy_id: f.id,
    name: f.name,
    client_id: clientId,
    created_at: f.created_date || null,
    updated_at: f.updated_date || null,
  }).select("id").single();
  if (error) {
    console.log("folder fail", f.name, error.message);
    continue;
  }
  folderIdMap.set(f.id, data.id);
}

const { data: existingDocs } = await supabase.from("documents").select("legacy_id");
const existingDocIds = new Set((existingDocs || []).map((d) => d.legacy_id));
const docs = loadJson("Document");
const filesDir = path.join(dataDir, "files");

for (const d of docs) {
  if (existingDocIds.has(d.id)) continue;
  const newClientId = d.client_id ? clientIdMap.get(d.client_id) : null;
  if (!newClientId) {
    console.log("still missing client for doc", d.id, d.client_id);
    continue;
  }
  let storagePath = null;
  if (existsSync(filesDir) && d.file_url) {
    const originalName = decodeURIComponent(d.file_url.split("/").pop());
    const localFile = readdirSync(filesDir).find((f) => f.startsWith(`${d.id}_`));
    if (localFile) {
      const fileBuffer = readFileSync(path.join(filesDir, localFile));
      storagePath = `${newClientId}/${originalName}`;
      const { error: upErr } = await supabase.storage.from("documents").upload(storagePath, fileBuffer, {
        upsert: true,
        contentType: "application/pdf",
      });
      if (upErr) {
        console.log("upload fail", d.id, upErr.message);
        storagePath = null;
      }
    }
  }
  const { error } = await supabase.from("documents").insert({
    legacy_id: d.id,
    title: d.title,
    description: d.description || null,
    category: d.category || null,
    file_url: storagePath ? null : d.file_url || null,
    storage_path: storagePath,
    client_id: newClientId,
    folder_id: d.folder_id ? folderIdMap.get(d.folder_id) || null : null,
    status: d.status || "Pendente",
    created_at: d.created_date || null,
    updated_at: d.updated_date || null,
  });
  if (error) console.log("doc fail", d.id, error.message);
  else console.log("inserted doc", d.title);
}

console.log("done");
