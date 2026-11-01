// Shared by main, preload and renderer. Keep this file free of Node/Electron imports.

export const CHANNELS = {
  status: "pocketPoke:status",
  inject: "pocketPoke:inject",
} as const;

export interface ConnOpts {
  ip: string;
  port?: number; // default 6000
  timeout?: number; // seconds, 0 < t <= 10 (default 3)
}

export interface SwitchStatus {
  reachable: boolean; // could we connect to sys-botbase at all?
  acnh_running: boolean; // is ACNH the running title?
  error: string | null;
}

export interface InjectRequest extends ConnOpts {
  player?: number; // 1-8, default 1
  items: string[]; // hex strings, e.g. ["0x21FE", "0x00020000000A1234"]
}

export interface InjectResult {
  status: "success";
  injected_items: string[]; // zero-padded hex, e.g. "0x00000000000021fe"
}

// Replaces HTTP status codes (409 / 502 / 504 / 400 in the old FastAPI version).
export type ErrorCode =
  | "INVALID_INPUT" // 400
  | "ACNH_NOT_RUNNING" // 409
  | "TIMEOUT" // 504
  | "REFUSED" // 502
  | "NETWORK" // 502
  | "INTERNAL"; // 500

export interface IpcError {
  code: ErrorCode;
  message: string;
}

// ipcRenderer.invoke rejections lose their type and get a noisy prefix,
// so handlers return this envelope instead of throwing.
export type IpcResult<T> = { ok: true; data: T } | { ok: false; error: IpcError };

// Shape of window.pocketPoke, as exposed by the preload script.
export interface PocketPokeBridge {
  getSwitchStatus(opts: ConnOpts): Promise<IpcResult<SwitchStatus>>;
  injectItems(req: InjectRequest): Promise<IpcResult<InjectResult>>;
}
