"use client";

import { getStatus } from "@/lib/pocketPoke";
import { useEffect, useState } from "react";

type SwitchStatus = "disconnected" | "connecting" | "connected" | "error";

const STATUS: Record<
  SwitchStatus,
  { label: string; dot: string; pill: string; animate?: string }
> = {
  disconnected: {
    label: "Switch disconnected",
    dot: "bg-slate-400",
    pill: "bg-slate-700 text-slate-300",
  },
  connected: {
    label: "Switch connected",
    dot: "bg-emerald-400",
    pill: "bg-slate-700 text-emerald-200",
    animate: "animate-ping",
  },
  error: {
    label: "Connection failed",
    dot: "bg-red-500",
    pill: "bg-slate-700 text-red-200",
  },
};

export default function NintendoSwitchStatus({
  status,
  ip,
  onClick,
}: {
  status: SwitchStatus;
  ip?: string;
  onClick?: () => void;
}) {
  const [STATUS, setStatus] = useState<SwitchStatus>("disconnected");

  async function checkStatus()
  {
        const res = await getStatus({ip:"10.151.247.77", port:6000});
        if(res.reachable && res.acnh_running)
        {
            console.log("Connected to Switch and ACNH is running");
            setStatus("connected");
        }
        else if(res.reachable && !res.acnh_running)
        {
            console.log("Connected to Switch but ACNH is not running");
            setStatus("connecting");
        }
        else
        {
            console.log("Switch is unreachable");
            setStatus("error");
        }
  }
    useEffect(() => {
        const id = setInterval(() => {
            // your code here
            checkStatus();
        }, 10000);

        return () => clearInterval(id);
    },[])

  return (
    <button
      onClick={onClick}
      disabled={status === "connecting"}
      title={status === "connected" && ip ? `Connected to ${ip}` : undefined}
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${STATUS.pill} hover:brightness-110 disabled:cursor-wait`}
    >
      <span className="relative flex size-2.5">
        {STATUS.animate && (
          <span
            className={`absolute inline-flex size-full rounded-full opacity-75 ${STATUS.dot} ${STATUS.animate}`}
          />
        )}
        <span className={`relative inline-flex size-2.5 rounded-full ${STATUS.dot}`} />
      </span>
      {STATUS.label}
    </button>
  );
}