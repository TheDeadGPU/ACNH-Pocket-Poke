"use client";

import { useState, useEffect } from "react";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { getStatus } from "@/lib/pocketPoke";
import { isValidIPv4 } from "@/lib/IPHelper";

export default function AppACNHStatusIndicator() {
    const { switchIP, switchPort } = useACNHPocketPokeContext();
    const [result, setResult] = useState<{
        target: string;
        reachable: boolean;
        acnhRunning: boolean;
        error: string | null;
    } | null>(null);
    const target = `${switchIP}:${switchPort}`;
    const port = Number(switchPort);
    const validPort = Number.isInteger(port) && port >= 1 && port <= 65535;
    const validIP = isValidIPv4(switchIP);

    useEffect(() => {
        if (!validIP || !validPort) return;
        let isMounted = true;
        const verify = async () => {
            try {
                const status = await getStatus(
                    { ip: switchIP, port },
                    AbortSignal.timeout(15_000),
                );
                if (isMounted) {
                    setResult({
                        target,
                        reachable: status.reachable,
                        acnhRunning: status.acnh_running,
                        error: status.error,
                    });
                }
            } catch (error) {
                if (isMounted) {
                    setResult({
                        target,
                        reachable: false,
                        acnhRunning: false,
                        error: error instanceof Error ? error.message : "Unable to check Switch status",
                    });
                }
            }
        };

        void verify();
        const intervalId = setInterval(() => {
            void verify();
        }, 30_000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [port, switchIP, target, validIP, validPort]);

    const isLoading = validIP && validPort && result?.target !== target;
    const isReachable = result?.target === target ? result.reachable : null;
    const isACNHRunnable = result?.target === target ? result.acnhRunning : null;
    const error = result?.target === target ? result.error : null;
    const label = !switchIP
        ? "Add Switch IP"
        : !validIP
            ? "Invalid Switch IP"
            : !validPort
                ? "Invalid port"
                : isLoading
                    ? "Checking Switch..."
                    : isACNHRunnable
                ? "ACNH ready"
                : isReachable
                    ? "Switch connected · ACNH not running"
                    : "Switch unreachable";

    return (
        <div className="flex items-center gap-2 text-sm font-medium" title={error ?? undefined} aria-live="polite">
            <span
                className={`inline-block size-3 rounded-full transition-colors ${
                    isLoading
                        ? "animate-pulse bg-yellow-400"
                        : isACNHRunnable
                            ? "bg-green-500 shadow-sm shadow-green-500/50"
                            : isReachable
                                ? "bg-yellow-500"
                                : "bg-red-500 shadow-sm shadow-red-500/50"
                }`}
            />
            <span className="font-bold text-gray-700 dark:text-gray-300">{label}</span>
        </div>
    );
}