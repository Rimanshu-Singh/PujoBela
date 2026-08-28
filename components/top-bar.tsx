"use client";

import { useEffect, useMemo, useState } from "react";
import { InstagramIcon, ShareIcon } from "@/components/icons";

const formatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parts = useMemo(() => now ? formatter.formatToParts(now) : [], [now]);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "--";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "--";
  const dayPeriod = parts.find((part) => part.type === "dayPeriod")?.value ?? "";

  return (
    <div className="flex items-baseline gap-1 font-medium tracking-[-0.02em] text-white drop-shadow-md" aria-label={now ? formatter.format(now) : "Kolkata time loading"}>
      <span className="text-[15px] sm:text-base">{hour}</span>
      <span className="clock-colon text-pujo-light">:</span>
      <span className="text-[15px] sm:text-base">{minute}</span>
      <span className="ml-0.5 text-[9px] font-semibold tracking-[0.1em] text-white/65 sm:text-[10px]">{dayPeriod}</span>
    </div>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return <a href={href} aria-label={label} className="grid size-8 place-items-center rounded-full border border-white/10 bg-black/10 text-white/75 backdrop-blur-md transition hover:bg-white/15 hover:text-white sm:size-9">{children}</a>;
}

export function TopBar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-20 text-shadow-sm">
      <div className="absolute left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] pointer-events-auto sm:left-[max(1.5rem,env(safe-area-inset-left))] sm:top-[max(1.5rem,env(safe-area-inset-top))]">
        <Clock />
        <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50">Kolkata</p>
      </div>

      <div className="absolute left-1/2 top-[max(1rem,env(safe-area-inset-top))] -translate-x-1/2 sm:top-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/10 px-3 py-2 backdrop-blur-md">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-pujo-light opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-pujo-light" />
          </span>
          <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75 sm:text-[11px]">2,847 listening</span>
        </div>
      </div>

      <nav aria-label="Social links" className="pointer-events-auto absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] flex gap-1.5 sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:top-[max(1.5rem,env(safe-area-inset-top))] sm:gap-2">
        <SocialLink href="https://www.instagram.com/" label="Visit Instagram"><InstagramIcon className="size-4" /></SocialLink>
        <SocialLink href="#share" label="Share Pujo Bela"><ShareIcon className="size-4" /></SocialLink>
      </nav>
    </header>
  );
}
