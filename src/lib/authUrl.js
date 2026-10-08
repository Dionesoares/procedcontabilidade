/** Parse Supabase auth params from URL hash or query string. */
export function parseAuthCallbackParams(location = window.location) {
  const fromHash = new URLSearchParams(location.hash.startsWith("#") ? location.hash.slice(1) : location.hash);
  const fromQuery = new URLSearchParams(location.search);
  const get = (key) => fromHash.get(key) || fromQuery.get(key);

  return {
    error: get("error"),
    errorCode: get("error_code"),
    errorDescription: get("error_description"),
    code: get("code"),
    type: get("type"),
    accessToken: get("access_token"),
    refreshToken: get("refresh_token"),
  };
}

export function authErrorMessage(params) {
  const code = (params.errorCode || "").toLowerCase();
  const desc = decodeURIComponent(params.errorDescription || "").toLowerCase();
  if (code === "otp_expired" || desc.includes("expired") || desc.includes("invalid")) {
    return "O link de recuperação expirou ou já foi usado. Solicite um novo link abaixo.";
  }
  if (params.error) {
    return "Não foi possível validar o link de acesso. Solicite um novo link de recuperação.";
  }
  return null;
}

/** Clear auth hash/query noise from the address bar without a navigation. */
export function clearAuthParamsFromUrl() {
  const url = new URL(window.location.href);
  url.hash = "";
  ["error", "error_code", "error_description", "code", "type", "access_token", "refresh_token", "sb"].forEach((k) => {
    url.searchParams.delete(k);
  });
  window.history.replaceState({}, "", `${url.pathname}${url.search}`);
}
