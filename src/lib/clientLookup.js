import { Client } from "@/api/entities";
import { invokeFunction } from "@/api/functions";

// Label shown for a client across dropdowns/lists: company name (Razão
// Social) when available, falling back to the contact's personal name.
export function getClientDisplayName(client) {
  return client?.company_name || client?.name || "";
}

// Sorts clients alphabetically (pt-BR, accent/case-insensitive) by razão
// social (`company_name`) only. Clients without company_name go to the end.
export function sortClientsByName(clients) {
  return [...(clients || [])].sort((a, b) => {
    const aCompany = (a?.company_name || "").trim();
    const bCompany = (b?.company_name || "").trim();
    if (!aCompany && !bCompany) return 0;
    if (!aCompany) return 1;
    if (!bCompany) return -1;
    return aCompany.localeCompare(bCompany, "pt-BR", { sensitivity: "base", numeric: true });
  });
}

// Finds the Client record linked to the logged-in user.
// Falls back to a server-side lookup-by-email that also backfills `user_id`
// (see api/link-client.js). This fixes accounts created by the contador
// before the client ever registered/logged in — a plain client-side query
// can't do this fallback itself because Supabase RLS only lets a client see
// rows that already match their own `user_id`.
export async function getMyClient(user) {
  const clients = await Client.filter({ user_id: user.id });
  if (clients[0]) return clients[0];

  try {
    const res = await invokeFunction("link-client", {});
    return res?.data?.client || null;
  } catch {
    return null;
  }
}
