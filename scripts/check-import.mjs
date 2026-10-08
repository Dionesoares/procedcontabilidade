import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#") || !t.includes("=")) continue;
  const i = t.indexOf("=");
  const k = t.slice(0, i).trim();
  const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  if (!(k in process.env)) process.env[k] = v;
}

const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const tables = [
  "profiles", "clients", "financial_records", "document_folders", "documents",
  "contracts", "contact_submissions", "tipos_lancamento", "descricoes_lancamento",
  "contas_contabil", "balancetes", "balancete_lancamentos",
];
for (const t of tables) {
  const { count, error } = await s.from(t).select("*", { count: "exact", head: true });
  console.log(t.padEnd(24), error?.message || count);
}
const { data: clients } = await s.from("clients").select("id,name,legacy_id,email");
console.log("clients", JSON.stringify(clients, null, 2));
const { data: profiles } = await s.from("profiles").select("email,role");
console.log("profiles", profiles);
