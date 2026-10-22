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
  connecting: {
    label: "Checking Switch...",
    dot: "bg-yellow-400",
    pill: "bg-slate-700 text-yellow-200",
    animate: "animate-ping",
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
  const statusStyle = STATUS[status];

  return (
    <button
      onClick={onClick}
      disabled={status === "connecting"}
      title={status === "connected" && ip ? `Connected to ${ip}` : undefined}
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${statusStyle.pill} hover:brightness-110 disabled:cursor-wait`}
    >
      <span className="relative flex size-2.5">
        {statusStyle.animate && (
          <span
            className={`absolute inline-flex size-full rounded-full opacity-75 ${statusStyle.dot} ${statusStyle.animate}`}
          />
        )}
        <span className={`relative inline-flex size-2.5 rounded-full ${statusStyle.dot}`} />
      </span>
      {statusStyle.label}
    </button>
  );
}