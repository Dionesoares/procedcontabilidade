import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { parseAuthCallbackParams, authErrorMessage } from "@/lib/authUrl";

/**
 * When Supabase redirects recovery/signup failures to Site URL (often "/"),
 * the error lands in the hash. Send the user to the right recovery screen
 * instead of leaving them on the home page with a broken hash.
 */
export default function AuthCallbackRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = parseAuthCallbackParams();
    const message = authErrorMessage(params);
    if (!message) return;

    // Already on a page that shows the recovery form — keep local handling.
    if (location.pathname === "/reset-password" || location.pathname === "/forgot-password") return;

    const isRecoveryish =
      params.type === "recovery" ||
      params.errorCode === "otp_expired" ||
      (params.errorDescription || "").includes("expired");

    navigate(
      `${isRecoveryish ? "/forgot-password" : "/login"}?reason=${encodeURIComponent(message)}`,
      { replace: true }
    );
  }, [location.pathname, location.hash, location.search, navigate]);

  return null;
}
