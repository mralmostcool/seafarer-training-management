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
    <div className="border-t border-hairline pt-4">
      <div className="flex flex-col gap-2 rounded-md border border-hairline bg-surface-soft p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Sync State</span>
          <button
            onClick={checkConnection}
            disabled={status === "checking"}
            className="text-[10px] font-semibold text-accent-interactive hover:underline disabled:text-muted-text disabled:no-underline transition-all duration-200 cursor-pointer"
          >
            Check Now
          </button>
        </div>

        <div className="flex items-center gap-2 mt-1">
          {status === "checking" && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-warning opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-warning"></span>
              </span>
              <span className="text-xs font-semibold text-brand-warning">Checking connection...</span>
            </>
          )}

          {status === "connected" && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
              </span>
              <span className="text-xs font-semibold text-brand-success">Synced with Server</span>
            </>
          )}

          {status === "disconnected" && (
            <>
              <span className="h-2 w-2 rounded-full bg-brand-error"></span>
              <span className="text-xs font-semibold text-brand-error">Disconnected</span>
            </>
          )}
        </div>

        {lastCheck && (
          <p className="text-[9px] font-mono text-muted-text mt-1">
            Last checked: {lastCheck.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

