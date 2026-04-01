export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
  return base.replace(/\/$/, "");
}

function apiHostIsNgrok(): boolean {
  try {
    return new URL(getApiBaseUrl()).hostname.includes("ngrok");
  } catch {
    return false;
  }
}

/** Merge headers; adds ngrok skip header when API base is an ngrok URL (avoids free-tier HTML interstitial + broken CORS). */
export function withApiHeaders(init?: HeadersInit): Headers {
  const h = new Headers(init ?? undefined);
  if (apiHostIsNgrok()) {
    h.set("ngrok-skip-browser-warning", "69420");
  }
  return h;
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
