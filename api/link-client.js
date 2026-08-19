// Vercel Serverless Function — links the logged-in user's account to their
// `clients` row by email, when the row was created by staff (contador/admin)
// before the client ever registered/logged in (so `clients.user_id` is still
// null). This must run with the service role key because the `clients` RLS
// policy only lets a client SELECT/UPDATE rows that already match their own
// `user_id` — a plain client-side "find by email" query would return nothing
// for exactly the rows that need linking.
import { getSupabaseAdmin, getAuthenticatedUser } from "./_lib/supabaseAdmin.js";

function withDateAliases(row) {
  if (!row) return row;
  return {
    ...row,
    created_date: row.created_at ?? row.created_date,
    updated_date: row.updated_at ?? row.updated_date,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const user = await getAuthenticatedUser(req, supabaseAdmin);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      res.status(200).json({ client: withDateAliases(existing) });
      return;
    }

    if (!user.email) {
      res.status(200).json({ client: null });
      return;
    }

    const { data: matches, error: matchError } = await supabaseAdmin
      .from("clients")
      .select("*")
      .ilike("email", user.email)
      .is("user_id", null)
      .limit(1);
    if (matchError) throw matchError;

    const match = matches?.[0];
    if (!match) {
      res.status(200).json({ client: null });
      return;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("clients")
      .update({ user_id: user.id })
      .eq("id", match.id)
      .select()
      .single();
    if (updateError) throw updateError;

    res.status(200).json({ client: withDateAliases(updated) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
