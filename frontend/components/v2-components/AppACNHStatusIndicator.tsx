"use client";

import { useState, useEffect, useCallback } from "react";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { getStatus } from "@/lib/pocketPoke";

export default function AppACNHStatusIndicator() {
    const { switchIP } = useACNHPocketPokeContext();
    const [isReachable, setIsReachable] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const checkStatus = useCallback(async (): Promise<boolean> => {
        try {
            const s = await getStatus({ ip: switchIP }, AbortSignal.timeout(15_000));
            return Boolean(s?.reachable);
        } catch (err) {
            return false;
        }
    }, [switchIP]);

    useEffect(() => {
        let isMounted = true;

        const verify = async (showLoading = false) => {
            if (showLoading) setIsLoading(true);
            const result = await checkStatus();
            if (isMounted) {
                setIsReachable(result);
                setIsLoading(false);
            }
        };

        // Run immediately on mount / IP change (show loading state on initial load)
        verify(true);

        // Set up polling every 30 seconds (30,000 ms)
        const intervalId = setInterval(() => {
            verify(false); // Background poll without flashing the "Checking..." state
        }, 30_000);

        // Cleanup interval on unmount or dependency change
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [checkStatus]);

    return (
        <div className="flex items-center gap-2 text-sm font-medium">
            {/* Status Indicator Dot */}
            <span 
                className={`inline-block w-3 h-3 rounded-full transition-colors ${
                    isLoading 
                        ? "bg-yellow-400 animate-pulse" 
                        : isReachable 
                            ? "bg-green-500 shadow-sm shadow-green-500/50" 
                            : "bg-red-500 shadow-sm shadow-red-500/50"
                }`} 
            />
            
            {/* Status Text */}
            <span className="font-bold text-gray-700 dark:text-gray-300">
                {isLoading 
                    ? "Checking Switch status..." 
                    : isReachable 
                        ? "ACNH ready" 
                        : "ACNH Unreachable"}
            </span>
        </div>
    );
}