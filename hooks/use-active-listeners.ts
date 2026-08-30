"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

function createTabId() {
  if (typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  if (typeof window.crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
  }

  return `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useActiveListeners() {
  const [activeListeners, setActiveListeners] = useState(1);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return null;

    return createClient(url, key, {
      auth: {
        persistSession: false,
      },
    });
  }, []);

  useEffect(() => {
    if (!supabase) {
      setActiveListeners(1);
      return;
    }

    const tabId = createTabId();
    const channel = supabase.channel("pujobela-active-listeners", {
      config: {
        presence: {
          key: tabId,
        },
      },
    });

    const updateActiveListeners = () => {
      const presenceState = channel.presenceState();
      setActiveListeners(Math.max(Object.keys(presenceState).length, 1));
    };

    channel
      .on("presence", { event: "sync" }, updateActiveListeners)
      .on("presence", { event: "join" }, updateActiveListeners)
      .on("presence", { event: "leave" }, updateActiveListeners)
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;

        await channel.track({
          tabId,
          onlineAt: new Date().toISOString(),
        });
        updateActiveListeners();
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  return activeListeners;
}
