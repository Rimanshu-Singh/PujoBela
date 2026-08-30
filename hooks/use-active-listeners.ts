"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

export function useActiveListeners() {
  const [activeListeners, setActiveListeners] = useState(1);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      console.log("Supabase URL:", url);
      console.log("Supabase Key:", key);
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

    const tabId = window.crypto.randomUUID();
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
