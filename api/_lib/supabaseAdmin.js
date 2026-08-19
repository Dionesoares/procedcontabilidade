// Shared helpers for Vercel Serverless Functions under /api.
// Uses the Supabase service role key — NEVER import this from frontend code.
import { createClient } from "@supabase/supabase-js";

let cachedClient = null;

export function getSupabaseAdmin() {
  if (cachedClient) return cachedClient;
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables");
  }
  cachedClient = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cachedClient;
}

// Verifies the caller's Supabase access token (sent as `Authorization: Bearer <token>`)
// and returns the corresponding auth user, or null if missing/invalid.
export async function getAuthenticatedUser(req, supabaseAdmin) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function getProfile(supabaseAdmin, userId) {
  const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).single();
  if (error) return null;
  return data;
}

export function isStaffRole(role) {
  return role === "admin" || role === "contador";
}

export function readJsonBody(req) {
  // Vercel's Node runtime already parses JSON bodies into req.body for
  // standard content types, but guard against string bodies just in case.
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}
