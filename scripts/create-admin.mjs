import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) {
  console.error("Missing ADMIN_EMAIL / ADMIN_PASSWORD");
  process.exit(1);
}

async function setAdminProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      role: "admin",
      email,
      display_name: "Administrador",
      full_name: "Administrador",
    })
    .eq("id", userId)
    .select();
  if (error) throw error;
  if (!data?.length) {
    const inserted = await supabase.from("profiles").insert({
      id: userId,
      role: "admin",
      email,
      display_name: "Administrador",
      full_name: "Administrador",
    }).select();
    if (inserted.error) throw inserted.error;
    return inserted.data;
  }
  return data;
}

const created = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: "Administrador" },
});

if (!created.error) {
  const profile = await setAdminProfile(created.data.user.id);
  console.log(JSON.stringify({ status: "created", id: created.data.user.id, role: profile[0]?.role }));
  process.exit(0);
}

console.log("create_error", created.error.message);
const listed = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
if (listed.error) {
  console.error("list_error", listed.error.message);
  process.exit(1);
}
const existing = listed.data.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
if (!existing) {
  console.error("user_not_found_after_create_error");
  process.exit(1);
}
const upd = await supabase.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
if (upd.error) {
  console.error("update_error", upd.error.message);
  process.exit(1);
}
const profile = await setAdminProfile(existing.id);
console.log(JSON.stringify({ status: "updated", id: existing.id, role: profile[0]?.role }));
