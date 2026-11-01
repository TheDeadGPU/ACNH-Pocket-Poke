import { useEffect, useState } from "react";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { getSwitchStatus, type SwitchStatus } from "@/pocketPoke";

export default function AppACNHStatusIndicator() {
    const [switchStatus, setSwitchStatus] = useState<SwitchStatus | null>(null);
    const [switchStatusError, setSwitchStatusError] = useState<string | null>(null);
    const [isCheckingSwitchStatus, setIsCheckingSwitchStatus] = useState(true);
    const { switchIP, switchPort } = useACNHPocketPokeContext();

    useEffect(() => {
        let isMounted = true;

        async function checkStatus() {
            setIsCheckingSwitchStatus(true);
            setSwitchStatus(null);
            setSwitchStatusError(null);

            try {
                const status = await getSwitchStatus({ ip: switchIP, port: switchPort });
                if (!isMounted) return;

                setSwitchStatus(status);
                if (!status.reachable) {
                    setSwitchStatusError(status.error ?? "Unable to reach the Switch");
                }
            } catch (error) {
                if (!isMounted) return;
                setSwitchStatusError(
                    error instanceof Error ? error.message : "Unable to get Switch status",
                );
            } finally {
                if (isMounted) {
                    setIsCheckingSwitchStatus(false);
                }
            }
        }

        void checkStatus();
        const intervalId = setInterval(() => {
            void checkStatus();
        }, 30_000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [switchIP, switchPort]);

    const label = isCheckingSwitchStatus
        ? "Checking Switch status..."
        : switchStatusError ??
          (switchStatus?.reachable
              ? switchStatus.acnh_running
                  ? "Switch is reachable and ACNH is running"
                  : "Switch is reachable, but ACNH isn't running"
              : "Switch status unavailable");

    const indicatorColor = isCheckingSwitchStatus
        ? "animate-pulse bg-yellow-400"
        : switchStatus?.reachable
          ? switchStatus.acnh_running
              ? "bg-green-500 shadow-sm shadow-green-500/50"
              : "bg-yellow-500"
          : "bg-red-500 shadow-sm shadow-red-500/50";

    return (
        <div
            className="flex items-center gap-2 text-sm font-medium"
            title={switchStatusError ?? undefined}
            aria-live="polite"
        >
            <span className={`inline-block size-3 rounded-full transition-colors ${indicatorColor}`} />
            <span className="font-bold text-gray-700 dark:text-gray-300">{label}</span>
        </div>
    );
}
