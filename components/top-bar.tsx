"use client";

import { ArrowUpRight, Check, Coffee, Copy, Mail, Radio, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { InstagramIcon } from "@/components/icons";

const formatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const DURGA_PUJA_DATE = new Date("2026-10-21T00:00:00+05:30");
// TODO: Replace with actual Buy Me a Coffee / UPI / payment link
const SUPPORT_URL = "#";
const CREATOR_EMAIL = "rimanshupatel1@gmail.com";
// TODO: Replace with Rimanshu Singh Instagram DP from @rimmu.1x
const CREATOR_IMAGE = "/creator/rimanshu-singh-placeholder.svg";

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
      className="time-card text-white"
      aria-label={label}
    >
      <div className="time-card-time">
        <span className="time-card-primary">{hour}</span>
        <span className="clock-colon text-pujo-light">:</span>
        <span className="time-card-primary">{minute}</span>
        <span className="time-card-meta ml-0.5">{dayPeriod}</span>
        <span className="time-card-meta">IST</span>
      </div>
      <p className="time-card-location">Kolkata</p>
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
    <div className="flex items-center rounded-full border border-white/25 bg-[#6c2d12]/25 px-3 py-2 text-[10px] font-semibold text-white shadow-[0_10px_30px_rgba(55,20,8,0.16)] backdrop-blur-2xl sm:px-4 sm:text-[12px]">
      <span className="whitespace-nowrap">{days ?? "--"} days until Durga Puja</span>
    </div>
  );
}

function BuilderDialogButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const closeDialog = () => {
    setIsOpen(false);
    setIsCopied(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CREATOR_EMAIL);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1800);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="About the creator"
        aria-haspopup="dialog"
        className="top-action-button"
      >
        <UserRound className="size-5" strokeWidth={1.9} />
      </button>

      {isOpen && (
        <div
          className="creator-dialog-backdrop pointer-events-auto fixed inset-0 z-[60] flex min-h-dvh items-center justify-center overflow-y-auto p-[14px]"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="builder-dialog-title"
            className="creator-dialog"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={closeDialog}
              aria-label="Close creator information"
              className="creator-dialog-close"
            >
              <X className="size-[18px]" strokeWidth={1.8} />
            </button>

            <h2 id="builder-dialog-title" className="creator-dialog-title">
              Made with bhalobasha by
            </h2>

            <article className="creator-profile-card">
              <img
                src={CREATOR_IMAGE}
                alt="Rimanshu Singh"
                className="creator-profile-image"
                width={96}
                height={96}
              />
              <h3 className="creator-profile-name">Rimanshu Singh</h3>

              <div className="creator-socials" aria-label="Creator contact links">
                <a
                  href="https://www.instagram.com/rimmu.1x/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Follow Rimanshu Singh on Instagram"
                  className="creator-social-button"
                >
                  <InstagramIcon className="size-[18px]" />
                </a>
                <a
                  href={`mailto:${CREATOR_EMAIL}`}
                  aria-label={`Email ${CREATOR_EMAIL}`}
                  className="creator-social-button"
                >
                  <Mail className="size-[18px]" strokeWidth={1.8} />
                </a>
              </div>
            </article>

            <div className="creator-contact">
              <p>Want to get in touch?</p>
              <div className="creator-email-pill">
                <a href={`mailto:${CREATOR_EMAIL}`} className="creator-email-address">
                  {CREATOR_EMAIL}
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="creator-copy-button"
                  aria-label={isCopied ? "Email copied" : "Copy email address"}
                >
                  {isCopied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                  {isCopied ? "Copied" : "Copy"}
                </button>
              </div>
              <span className="sr-only" aria-live="polite">{isCopied ? "Email address copied to clipboard" : ""}</span>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function SupportDialogButton() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const closeDialog = () => {
    setIsOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Support Pujo Radio"
        aria-haspopup="dialog"
        className="top-action-button"
      >
        <Coffee className="size-5" strokeWidth={1.9} />
      </button>

      {isOpen && (
        <div
          className="creator-backdrop pointer-events-auto fixed inset-0 z-[60] flex min-h-dvh items-center justify-center overflow-y-auto bg-black/[0.28] p-[14px] backdrop-blur-[8px]"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-dialog-title"
            className="support-card w-[calc(100vw-28px)] max-w-[430px] rounded-3xl p-[22px] text-[#fff7ed] sm:rounded-[28px] sm:p-[26px]"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="relative">
                <span className="absolute inset-1 rounded-full bg-[#ffb45e]/40 blur-xl" aria-hidden="true" />
                <div className="relative grid size-16 place-items-center rounded-[20px] border border-white/[0.22] bg-white/[0.12] text-[#ffd79a] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                  <Coffee className="size-7" strokeWidth={1.75} />
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={closeDialog}
                aria-label="Close support dialog"
                className="grid size-[42px] shrink-0 place-items-center rounded-[14px] bg-white/[0.12] text-white/70 transition hover:bg-white/[0.2] hover:text-white"
              >
                <X className="size-[18px]" />
              </button>
            </div>

            <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[rgba(255,216,170,0.72)]">Support the creator</p>
            <h2 id="support-dialog-title" className="mt-2 text-[23px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#fff7ed] sm:text-[26px]">
              Support Pujo Radio
            </h2>
            <p className="mt-3 text-[14px] leading-[1.6] text-[rgba(255,247,237,0.72)] sm:text-[15px]">
              If this Durga Puja vibe made you smile, you can support the creator with a small coffee.
            </p>
            <p className="mt-4 text-[13px] font-medium text-[rgba(255,247,237,0.62)]">Made with love by Rimanshu Singh</p>

            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex h-[54px] w-full items-center justify-between rounded-[18px] bg-[linear-gradient(135deg,#fff4df,#ffd29b)] px-4 text-[#3b2118] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(255,190,110,0.22),inset_0_1px_0_rgba(255,255,255,0.72)] sm:h-14"
            >
              <span className="flex items-center gap-3 text-[14px] font-extrabold">
                <Coffee className="size-5" strokeWidth={2} />
                Buy Me a Coffee
              </span>
              <ArrowUpRight className="size-[18px] opacity-60" strokeWidth={2} />
            </a>
            <p className="mt-3 text-center text-[11px] text-white/45">Your support helps keep this festive radio alive.</p>
          </section>
        </div>
      )}
    </>
  );
}

export function TopBar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 text-shadow-sm">
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

      <nav aria-label="Radio actions" className="top-actions pointer-events-auto absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:top-[max(1.5rem,env(safe-area-inset-top))]">
        <BuilderDialogButton />
        <SupportDialogButton />
      </nav>
    </header>
  );
}
