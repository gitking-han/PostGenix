export function API(path: string) {
  const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$, "");
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // If the base already includes /api and the path also starts with /api,
  // avoid duplicate /api/api in production URLs.
  if (base.toLowerCase().endsWith("/api") && normalizedPath.toLowerCase().startsWith("/api")) {
    normalizedPath = normalizedPath.replace(/^\/api/i, "");
  }

  return `${base}${normalizedPath}`;
}

export function authHeaders() {
  return { "auth-token": localStorage.getItem("authToken") || "" };
}

export function jsonHeaders() {
  return { ...authHeaders(), "Content-Type": "application/json" };
}
