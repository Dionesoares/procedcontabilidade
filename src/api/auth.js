// Thin compatibility layer that mimics the old `base44.auth.X` API on top of
// Supabase Auth + the `profiles` table.
import { supabase } from "./supabaseClient";

async function fetchProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

function mapUser(sessionUser, profile) {
  if (!sessionUser) return null;
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    role: profile?.role || "user",
    display_name: profile?.display_name || null,
    full_name: profile?.full_name || sessionUser.user_metadata?.full_name || null,
    phone: profile?.phone || null,
  };
}

export const auth = {
  // Returns the current authenticated user (profile merged in), or throws.
  async me() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const session = data?.session;
    if (!session) throw new Error("Not authenticated");
    const profile = await fetchProfile(session.user.id);
    return mapUser(session.user, profile);
  },

  async loginViaEmailPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  // Mirrors the old signature: logout(redirectTo?) — pass a URL to redirect
  // after sign out, or call with no args to just clear the session.
  async logout(redirectTo) {
    await supabase.auth.signOut();
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  },

  redirectToLogin() {
    window.location.href = "/login";
  },

  // Starts email/password signup. Supabase's free tier can only send the
  // default "confirmation link" email (no OTP code), so the caller should
  // show a "check your email" screen rather than an OTP input.
  async register({ email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
    return data;
  },

  async resendConfirmation(email) {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) throw error;
  },

  async resetPasswordRequest(email) {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    if (error) throw error;
  },

  // Sets a new password for the user currently holding a recovery session
  // (established automatically by the Supabase client from the reset link).
  async resetPassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async updateMe({ display_name, phone } = {}) {
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const session = data?.session;
    if (!session) throw new Error("Not authenticated");
    const { data: updated, error } = await supabase
      .from("profiles")
      .update({ display_name, phone })
      .eq("id", session.user.id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },
};
