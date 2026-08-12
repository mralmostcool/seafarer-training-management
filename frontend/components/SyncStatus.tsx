"use client";

import { useEffect, useState, useCallback } from "react";

type SyncState = "checking" | "connected" | "disconnected";

export default function SyncStatus() {
  const [status, setStatus] = useState<SyncState>("checking");
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = useCallback(async () => {
    setStatus("checking");
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      const res = await fetch("http://localhost:8080/actuator/health", {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(id);

      if (res.ok) {
        setStatus("connected");
      } else {
        setStatus("disconnected");
      }
    } catch (error) {
      setStatus("disconnected");
    } finally {
      setLastCheck(new Date());
    }
  }, []);

  useEffect(() => {
    checkConnection();
    // Poll every 10 seconds
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return (
    <div className="mt-auto border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <div className="flex flex-col gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Sync State</span>
          <button
            onClick={checkConnection}
            disabled={status === "checking"}
            className="text-[10px] font-medium text-blue-600 hover:text-blue-500 hover:underline disabled:text-zinc-400 transition-colors"
          >
            Check Now
          </button>
        </div>

        <div className="flex items-center gap-2 mt-1">
          {status === "checking" && (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Checking...</span>
            </>
          )}

          {status === "connected" && (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Synced</span>
            </>
          )}

          {status === "disconnected" && (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
              <span className="text-sm font-medium text-rose-700 dark:text-rose-400">Disconnected</span>
            </>
          )}
        </div>

        {lastCheck && (
          <p className="text-[10px] text-zinc-400 mt-1">
            Last checked: {lastCheck.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
