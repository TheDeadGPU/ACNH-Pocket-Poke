import type {
  ConnOpts,
  ErrorCode,
  InjectResult,
  IpcResult,
  PocketPokeBridge,
  SwitchStatus,
} from "../shared/ipc";

export type { ConnOpts, ErrorCode, InjectResult, SwitchStatus } from "../shared/ipc";

declare global {
  interface Window {
    pocketPoke: PocketPokeBridge;
  }
}

// `status` (HTTP code) became `code` (see ErrorCode in shared/ipc.ts).
export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function unwrap<T>(res: IpcResult<T>): T {
  if (!res.ok) throw new ApiError(res.error.code, res.error.message);
  return res.data;
}

export async function getStatus(opts: ConnOpts): Promise<SwitchStatus> {
  return unwrap(await window.pocketPoke.getStatus(opts));
}

export async function injectItems(
  opts: ConnOpts & { player?: number },
  items: string[], // e.g. ["0x21FE", "0x00020000000A1234"]
): Promise<InjectResult> {
  return unwrap(await window.pocketPoke.injectItems({ ...opts, items }));
}
