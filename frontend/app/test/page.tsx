"use client";

import { useState } from "react";
import { ApiError, getStatus, injectItems } from "@/lib/pocketPoke";

export default function InjectPage() {
  const [ip, setIp] = useState("192.168.12.115");
  const [player, setPlayer] = useState(1);
  const [itemsText, setItemsText] = useState("0x21FE");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<string>) {
    setBusy(true);
    setMessage(null);
    try {
      setMessage(await action());
    } catch (err) {
      setMessage(err instanceof ApiError ? `Error ${err.status}: ${err.message}` : String(err));
    } finally {
      setBusy(false);
    }
  }

  const checkStatus = () =>
    run(async () => {
      const s = await getStatus({ ip }, AbortSignal.timeout(15_000));
      if (!s.reachable) return `Unreachable: ${s.error}`;
      return s.acnh_running ? "Connected, ACNH is running" : "Connected, but ACNH isn't running";
    });

  const inject = () =>
    run(async () => {
      const items = itemsText.split(/[\s,]+/).filter(Boolean);
      const r = await injectItems({ ip, player }, items, AbortSignal.timeout(15_000));
      return `Injected ${r.injected_items.length} item(s)`;
    });

  return (
    <main className="mx-auto max-w-md space-y-3 p-6">
      <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="Switch IP" />
      <input
        type="number" min={1} max={8} value={player}
        onChange={(e) => setPlayer(Number(e.target.value))}
      />
      <textarea
        value={itemsText} onChange={(e) => setItemsText(e.target.value)}
        placeholder="0x21FE, 0x1234 ..."
      />
      <div className="flex gap-2">
        <button disabled={busy} onClick={checkStatus}>Check status</button>
        <button disabled={busy} onClick={inject}>Inject</button>
      </div>
      {message && <p>{message}</p>}
    </main>
  );
}