// Thin compatibility layer that mimics the old `base44.entities.X` API
// (list/filter/create/update/delete/bulkCreate) on top of Supabase tables.
// This keeps the diff small across the ~30 frontend files that consume it.
import { supabase } from "./supabaseClient";

// Base44 used `created_date` / `updated_date` as the sortable timestamp
// field names. Our Postgres schema uses `created_at` / `updated_at`.
const SORT_FIELD_MAP = {
  created_date: "created_at",
  updated_date: "updated_at",
};

function mapSortField(field) {
  return SORT_FIELD_MAP[field] || field;
}

function applySort(query, sort) {
  if (!sort) return query;
  const desc = sort.startsWith("-");
  const field = mapSortField(desc ? sort.slice(1) : sort);
  return query.order(field, { ascending: !desc });
}

// Adds back the Base44-style `created_date` / `updated_date` aliases so the
// ~30 frontend files that already display/format those fields keep working
// unchanged, while the DB itself uses idiomatic `created_at` / `updated_at`.
function withDateAliases(row) {
  if (!row) return row;
  return {
    ...row,
    created_date: row.created_at ?? row.created_date,
    updated_date: row.updated_at ?? row.updated_date,
  };
}

function withDateAliasesList(rows) {
  return Array.isArray(rows) ? rows.map(withDateAliases) : rows;
}

function createEntity(table) {
  return {
    async list(sort) {
      let query = supabase.from(table).select("*");
      query = applySort(query, sort);
      const { data, error } = await query;
      if (error) throw error;
      return withDateAliasesList(data);
    },

    async filter(match = {}, sort, limit) {
      let query = supabase.from(table).select("*");
      for (const [key, value] of Object.entries(match || {})) {
        query = query.eq(key, value);
      }
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return withDateAliasesList(data);
    },

    async get(id) {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
      if (error) throw error;
      return withDateAliases(data);
    },

    async create(values) {
      const { data, error } = await supabase.from(table).insert(values).select().single();
      if (error) throw error;
      return withDateAliases(data);
    },

    async update(id, values) {
      const { data, error } = await supabase.from(table).update(values).eq("id", id).select().single();
      if (error) throw error;
      return withDateAliases(data);
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return true;
    },

    async bulkCreate(rows) {
      const { data, error } = await supabase.from(table).insert(rows).select();
      if (error) throw error;
      return withDateAliasesList(data);
    },
  };
}

export const Client = createEntity("clients");
export const Task = createEntity("tasks");
export const ServiceRequest = createEntity("service_requests");
export const Message = createEntity("messages");
export const FinancialRecord = createEntity("financial_records");
export const Document = createEntity("documents");
export const DocumentFolder = createEntity("document_folders");
export const Contract = createEntity("contracts");
export const ContadorInvite = createEntity("contador_invites");
export const ContactSubmission = createEntity("contact_submissions");
export const TipoLancamento = createEntity("tipos_lancamento");
export const DescricaoLancamento = createEntity("descricoes_lancamento");
export const ContaContabil = createEntity("contas_contabil");
export const Balancete = createEntity("balancetes");
export const BalanceteLancamento = createEntity("balancete_lancamentos");

// ---------------------------------------------------------------------------
// Document storage helpers (Supabase Storage replaces Base44's Core.UploadFile)
// ---------------------------------------------------------------------------

const DOCUMENTS_BUCKET = "documents";

// Uploads a File to the private `documents` bucket under a per-client folder
// and returns the storage path to store on the `documents.storage_path` column.
export async function uploadDocumentFile(file, clientId) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${clientId}/${Date.now()}_${safeName}`;
  const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

// Resolves a downloadable URL for a document row: prefers a fresh signed URL
// generated from `storage_path` (private bucket) and falls back to a legacy
// `file_url` (e.g. records not yet migrated to Storage).
export async function resolveDocumentUrl(doc, expiresIn = 3600) {
  if (!doc) return null;
  if (doc.storage_path) {
    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(doc.storage_path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  }
  return doc.file_url || null;
}
