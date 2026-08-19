// Vercel Serverless Function — replaces Base44's `manageContadores` function
// and the direct base44.entities.User / base44.users.inviteUser calls that
// used to run from the frontend. All user/profile management that needs the
// Supabase Auth Admin API must go through here (never expose the service
// role key to the browser).
import { getSupabaseAdmin, getAuthenticatedUser, getProfile, isStaffRole, readJsonBody } from "./_lib/supabaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const caller = await getAuthenticatedUser(req, supabaseAdmin);
    if (!caller) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const callerProfile = await getProfile(supabaseAdmin, caller.id);
    if (!isStaffRole(callerProfile?.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const body = readJsonBody(req);
    const { action, role, userId, name, phone, email } = body;

    if (action === "list") {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("role", role || "contador");
      if (error) throw error;
      res.status(200).json({ contadores: data });
      return;
    }

    if (action === "findByEmail") {
      if (!email) {
        res.status(400).json({ error: "email is required" });
        return;
      }
      const { data, error } = await supabaseAdmin.from("profiles").select("*").ilike("email", email).maybeSingle();
      if (error) throw error;
      res.status(200).json({ user: data || null });
      return;
    }

    if (action === "invite") {
      if (!email) {
        res.status(400).json({ error: "email is required" });
        return;
      }
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: name },
        redirectTo: `${getSiteUrl(req)}/auth/callback`,
      });
      if (error) throw error;
      const newUserId = data.user.id;
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ role: role || "user", display_name: name || null, phone: phone || null })
        .eq("id", newUserId);
      if (profileError) throw profileError;
      res.status(200).json({ success: true, userId: newUserId });
      return;
    }

    if (action === "grantAccess") {
      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ role: role || "contador", display_name: name, phone })
        .eq("id", userId);
      if (error) throw error;
      res.status(200).json({ success: true });
      return;
    }

    if (action === "update") {
      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }
      const { error } = await supabaseAdmin.from("profiles").update({ display_name: name, phone }).eq("id", userId);
      if (error) throw error;
      res.status(200).json({ success: true });
      return;
    }

    if (action === "delete") {
      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;
      res.status(200).json({ success: true });
      return;
    }

    res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function getSiteUrl(req) {
  const origin = req.headers.origin;
  if (origin) return origin;
  const host = req.headers.host;
  if (host) return `https://${host}`;
  return process.env.SITE_URL || "https://procedcontabilidade.vercel.app";
}
