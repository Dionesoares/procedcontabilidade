// Vercel Serverless Function — replaces Base44's `applyContadorInvite` function.
// Called right after a user confirms their signup email. If there is a
// pending ContadorInvite matching their email, promotes them to `contador`
// and consumes the invite.
import { getSupabaseAdmin, getAuthenticatedUser } from "./_lib/supabaseAdmin.js";

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

    const { data: invites, error: inviteError } = await supabaseAdmin
      .from("contador_invites")
      .select("*")
      .ilike("email", user.email);
    if (inviteError) throw inviteError;

    if (!invites || invites.length === 0) {
      res.status(200).json({ applied: false });
      return;
    }

    const invite = invites[0];

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ role: "contador", display_name: invite.name, phone: invite.phone })
      .eq("id", user.id);
    if (updateError) throw updateError;

    const { error: deleteError } = await supabaseAdmin.from("contador_invites").delete().eq("id", invite.id);
    if (deleteError) throw deleteError;

    res.status(200).json({ applied: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
