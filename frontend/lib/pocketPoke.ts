const API_BASE = "/api";

export interface ConnOpts {
  ip: string;
  port?: number;     // default 6000 on the server
  timeout?: number;  // seconds, 0 < t <= 10
}

export interface SwitchStatus {
  reachable: boolean;
  acnh_running: boolean;
  error: string | null;
}

export interface InjectResult {
  status: "success";
  injected_items: string[]; // zero-padded hex, e.g. "0x00000000000021fe"
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) qs.set(k, String(v));
  }
  return qs.toString();
}

// HTTPException -> {detail: string}; FastAPI 422 -> {detail: [{loc, msg}, ...]}
async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail
        .map((d: { loc: (string | number)[]; msg: string }) => `${d.loc.join(".")}: ${d.msg}`)
        .join("; ");
    }
  } catch {
    /* body wasn't JSON */
  }
  return res.statusText || `HTTP ${res.status}`;
}

export async function getStatus(opts: ConnOpts, signal?: AbortSignal): Promise<SwitchStatus> {
  const qs = buildQuery({ ip: opts.ip, port: opts.port, timeout: opts.timeout });
  const res = await fetch(`${API_BASE}/status?${qs}`, { signal });
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res));
  return res.json();
}

export async function injectItems(
  opts: ConnOpts & { player?: number },
  items: string[], // e.g. ["0x21FE", "0x00020000000A1234"]
  signal?: AbortSignal,
): Promise<InjectResult> {
  const qs = buildQuery({
    ip: opts.ip,
    player: opts.player,
    port: opts.port,
    timeout: opts.timeout,
  });
  const res = await fetch(`${API_BASE}/inject?${qs}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items), // bare array, matches `items: list[str]` body
    signal,
  });
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res));
  return res.json();
}