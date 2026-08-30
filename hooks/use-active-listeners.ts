"use client";

import { useEffect, useRef, useState } from "react";

const HEARTBEAT_INTERVAL_MS = 20_000;

type PresenceResponse = {
  count?: unknown;
};

export function useActiveListeners() {
  const [activeListeners, setActiveListeners] = useState(1);
  const tabIdRef = useRef<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    let isActive = true;

    try {
      tabIdRef.current ??= window.crypto.randomUUID();
    } catch {
      setActiveListeners(1);
      return;
    }

    const sendHeartbeat = async () => {
      if (!tabIdRef.current) return;

      try {
        const response = await fetch("/api/presence", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "heartbeat",
            sessionId: tabIdRef.current,
          }),
          cache: "no-store",
          signal: abortController.signal,
        });

        if (!response.ok) throw new Error("Presence heartbeat failed");

        const data = (await response.json()) as PresenceResponse;
        if (
          isActive &&
          typeof data.count === "number" &&
          Number.isFinite(data.count)
        ) {
          setActiveListeners(Math.max(1, Math.floor(data.count)));
        } else if (isActive) {
          setActiveListeners(1);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (isActive) setActiveListeners(1);
      }
    };

    const leave = () => {
      if (!tabIdRef.current) return;

      const payload = JSON.stringify({
        action: "leave",
        sessionId: tabIdRef.current,
      });

      navigator.sendBeacon("/api/presence", payload);
    };

    void sendHeartbeat();
    const heartbeatInterval = window.setInterval(
      () => void sendHeartbeat(),
      HEARTBEAT_INTERVAL_MS,
    );
    window.addEventListener("pagehide", leave);
    window.addEventListener("beforeunload", leave);

    return () => {
      isActive = false;
      window.clearInterval(heartbeatInterval);
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("beforeunload", leave);
      abortController.abort();
      leave();
    };
  }, []);

  return activeListeners;
}
