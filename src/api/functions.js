// Thin compatibility layer that mimics `base44.functions.invoke(name, payload)`
// on top of our Vercel Serverless Functions under /api. Automatically attaches
// the current Supabase session's access token so the function can identify
// the caller (see api/_lib/supabaseAdmin.js -> getAuthenticatedUser).
import { supabase } from "./supabaseClient";

export async function invokeFunction(name, payload = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const res = await fetch(`/api/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || `Request failed with status ${res.status}`);
  }
  return { data: json };
}
