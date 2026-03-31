export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
  return base.replace(/\/$/, "");
}

/** WebSocket URL for the risk stream (`/ws` on the API host). */
export function getWsUrl(): string {
  const base = getApiBaseUrl();
  const u = new URL(base);
  u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
  u.pathname = "/ws";
  u.search = "";
  u.hash = "";
  return u.toString();
}
