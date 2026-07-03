import { base44 } from "@/api/base44Client";

// Finds the Client record linked to the logged-in user.
// Falls back to matching by email (case-insensitive) and backfills user_id
// so future lookups are direct. This fixes accounts created by the contador
// before the client ever registered/logged in.
export async function getMyClient(user) {
  let clients = await base44.entities.Client.filter({ user_id: user.id });
  let client = clients[0];

  if (!client && user.email) {
    const all = await base44.entities.Client.list();
    client = all.find(c => c.email?.toLowerCase() === user.email.toLowerCase());
    if (client) {
      try {
        await base44.entities.Client.update(client.id, { user_id: user.id });
        client = { ...client, user_id: user.id };
      } catch {}
    }
  }

  return client || null;
}