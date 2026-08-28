"use client";

import { Coffee, Radio, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const ONLINE_USERS = 246;
const DURGA_PUJA_DATE = new Date("2026-10-21T00:00:00+05:30");

function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parts = useMemo(() => (now ? formatter.formatToParts(now) : []), [now]);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "--";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "--";
  const dayPeriod = parts.find((part) => part.type === "dayPeriod")?.value ?? "";
  const label = now ? `${formatter.format(now).toLowerCase()} IST Kolkata` : "Kolkata time loading";

  return (
    <div
      className="rounded-[14px] border border-white/20 bg-[#5c260f]/20 px-3 py-2 text-white shadow-[0_8px_24px_rgba(51,18,6,0.14)] backdrop-blur-xl"
      aria-label={label}
    >
      <div className="flex items-baseline gap-1 font-medium leading-none tracking-normal">
        <span className="text-[12px] sm:text-[13px]">{hour}</span>
        <span className="clock-colon text-pujo-light">:</span>
        <span className="text-[12px] sm:text-[13px]">{minute}</span>
        <span className="ml-0.5 text-[9px] font-semibold uppercase tracking-normal text-white/75">{dayPeriod}</span>
        <span className="text-[9px] font-semibold uppercase tracking-normal text-white/65">IST</span>
      </div>
      <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/65">Kolkata</p>
    </div>
  );
}

function CountdownPill() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const difference = DURGA_PUJA_DATE.getTime() - Date.now();
      setDays(Math.max(0, Math.ceil(difference / 86_400_000)));
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/25 bg-[#6c2d12]/25 px-2.5 py-1.5 text-[9px] font-semibold text-white shadow-[0_10px_30px_rgba(55,20,8,0.16)] backdrop-blur-2xl min-[380px]:gap-2 min-[380px]:px-3 min-[380px]:py-2 min-[380px]:text-[10px] sm:px-4 sm:text-[12px]">
      <span className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="size-2 rounded-full bg-[#47e882] shadow-[0_0_10px_rgba(71,232,130,0.85)]" />
        {ONLINE_USERS} online
      </span>
      <span className="h-3 w-px bg-white/25" aria-hidden="true" />
      <span className="whitespace-nowrap">{days ?? "--"} days until Durga Puja</span>
    </div>
  );
}

function ActionButton({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex size-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/25 bg-[#5c260f]/20 p-0 text-[11px] font-semibold text-white shadow-[0_8px_24px_rgba(51,18,6,0.14)] backdrop-blur-xl transition hover:border-white/40 hover:bg-white/[0.16] sm:h-10 sm:w-auto sm:min-w-10 sm:px-3"
    >
      {children}
    </a>
  );
}

export function TopBar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-20 text-shadow-sm">
      <div className="pointer-events-auto absolute left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] sm:left-[max(1.5rem,env(safe-area-inset-left))] sm:top-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="mb-2 flex items-center gap-2 text-white drop-shadow-sm">
          <span className="grid size-7 place-items-center rounded-full border border-white/25 bg-[#6c2d12]/25 backdrop-blur-xl min-[380px]:size-8 sm:size-9">
            <Radio className="size-4" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[12px] font-semibold leading-none tracking-normal min-[380px]:text-[13px] sm:text-[15px]">Pujo Radio</p>
            <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.16em] text-white/60 min-[380px]:text-[8px]">Live from Kolkata</p>
          </div>
        </div>
        <Clock />
      </div>

      <div className="absolute left-1/2 top-[calc(max(1rem,env(safe-area-inset-top))+5.75rem)] -translate-x-1/2 sm:top-[max(1.5rem,env(safe-area-inset-top))]">
        <CountdownPill />
      </div>

      <nav aria-label="Radio actions" className="pointer-events-auto absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] flex gap-2 sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:top-[max(1.5rem,env(safe-area-inset-top))]">
        <ActionButton href="#listeners" label={`${ONLINE_USERS} listeners online`}>
          <Users className="size-4" strokeWidth={2} />
          <span className="hidden sm:inline">{ONLINE_USERS}</span>
        </ActionButton>
        <ActionButton href="#support" label="Support Pujo Radio">
          <Coffee className="size-4" strokeWidth={2} />
        </ActionButton>
      </nav>
    </header>
  );
}
