"use client";

import { ArrowUpRight, Check, Coffee, Copy, Mail, Users, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { InstagramIcon } from "@/components/icons";
import { useActiveListeners } from "@/hooks/use-active-listeners";

const formatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const DURGA_PUJA_DATE = new Date("2026-10-21T00:00:00+05:30");
// TODO: Replace with actual Buy Me a Coffee / UPI / payment link
const SUPPORT_URL = "#";
const PLAYLIST_URL = "https://music.youtube.com/playlist?list=PLR949LBNtYuU&si=3zFEKUjp7ie3jkl5";
const CREATOR_EMAIL = "rimanshupatel1@gmail.com";
// TODO: Replace with Rimanshu Singh Instagram DP from @rimmu.1x
const CREATOR_IMAGE = "/creator/profile.jpg";

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
  const label = now ? `${formatter.format(now).toLowerCase()} IST` : "Local time loading";

  return (
    <div
      className="box-border flex h-11 shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/[0.07] px-3.5 text-sm font-medium tabular-nums text-white shadow-[0_6px_18px_rgba(0,0,0,0.08)] backdrop-blur-2xl backdrop-saturate-150"
      aria-label={label}
    >
      {hour}
      <span className="clock-colon">:</span>
      {minute}
      <span className="ml-1.5 text-white/70">{dayPeriod}</span>
      <span className="ml-1.5 text-white/70">IST</span>
    </div>
  );
}

function CountdownPill() {
  const [days, setDays] = useState<number | null>(null);
  const activeListeners = useActiveListeners();

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
    <div
      className="box-border flex h-11 shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/[0.07] px-3.5 text-sm font-medium text-white shadow-[0_6px_18px_rgba(0,0,0,0.08)] backdrop-blur-2xl backdrop-saturate-150"
      aria-live="polite"
      aria-label={`${activeListeners} online, ${days ?? "unknown"} days until Durga Puja`}
      title={`${activeListeners} online`}
    >
      <span className="relative flex size-2 shrink-0 items-center justify-center">
        <span className="animate-online-pulse absolute size-full rounded-full bg-green-400" />
        <span className="relative size-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
      </span>
      <span className="ml-2 whitespace-nowrap tabular-nums">
        {activeListeners} online
      </span>
      <span className="mx-3 hidden h-4 w-0.5 shrink-0 rounded-full bg-white/20 sm:inline-block" aria-hidden="true" />
      <span className="hidden whitespace-nowrap text-white/70 sm:inline">
        <span className="tabular-nums text-white/90">{days ?? "--"}</span> days until Durga Puja
      </span>
    </div>
  );
}

function PlaylistLinks() {
  return (
    <div className="box-border flex h-11 shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/[0.07] p-1.5 text-white shadow-[0_6px_18px_rgba(0,0,0,0.08)] backdrop-blur-2xl backdrop-saturate-150">
      <a
        href={PLAYLIST_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open the Durga Puja playlist on YouTube Music"
        className="grid size-8 place-items-center rounded-full text-white transition hover:bg-white/15 active:scale-95"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z" />
        </svg>
      </a>
      <a
        href={PLAYLIST_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open the Durga Puja playlist on YouTube Music"
        className="grid size-8 place-items-center rounded-full text-white transition hover:bg-white/15 active:scale-95"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      </a>
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
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
        aria-expanded={isOpen}
        className="grid size-8 place-items-center rounded-full text-white transition hover:bg-white/15 active:scale-95"
      >
        <Users className="size-4" strokeWidth={2} />
      </button>

      {isOpen && createPortal(
        <div
          className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="builder-dialog-title"
        >
          <div
            className="animate-overlay-fade-in absolute inset-0 bg-black/70 backdrop-blur-xl"
            aria-hidden="true"
            onPointerDown={closeDialog}
          />
          <section className="animate-overlay-scale-in relative w-full max-w-lg rounded-[32px] border border-white/15 bg-white/[0.07] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl backdrop-saturate-150 max-[520px]:rounded-[26px] max-[520px]:p-5">
            <button
              ref={closeRef}
              type="button"
              onClick={closeDialog}
              aria-label="Close"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white active:scale-95"
            >
              <X className="size-4" strokeWidth={2} />
            </button>

            <h2 id="builder-dialog-title" className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Made with bhalobasha by
            </h2>

            <article className="mx-auto mt-6 flex w-full max-w-[220px] flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-center">
              <div className="grid size-20 place-items-center overflow-hidden rounded-full border border-white/15 bg-white/10 shadow-inner">
                <img
                  src={CREATOR_IMAGE}
                  alt="Rimanshu Singh"
                  className="size-full object-cover"
                  width={80}
                  height={80}
                />
              </div>
              <p className="text-sm font-semibold text-white">Rimanshu Singh</p>

              <div className="flex items-center gap-2" aria-label="Creator contact links">
                <a
                  href="https://www.instagram.com/rimmu.1x/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Rimanshu Singh on Instagram"
                  className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/15 active:scale-95"
                >
                  <InstagramIcon className="size-4" />
                </a>
                <a
                  href={`mailto:${CREATOR_EMAIL}`}
                  aria-label={`Email ${CREATOR_EMAIL}`}
                  className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/15 active:scale-95"
                >
                  <Mail className="size-4" strokeWidth={1.8} />
                </a>
              </div>
            </article>

            <div className="mt-5 flex flex-col items-center gap-1.5 border-t border-white/10 pt-5 text-center">
              <p className="text-[11px] text-white/50">Want to get in touch?</p>
              <button
                type="button"
                onClick={copyEmail}
                className="group/copy inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] py-1.5 pl-4 pr-2 text-xs text-white/80 transition hover:bg-white/10 active:scale-95"
                aria-label={isCopied ? "Email copied" : "Copy email address"}
              >
                <span className="select-all truncate tabular-nums">
                  {CREATOR_EMAIL}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/60 transition group-hover/copy:text-white/90">
                  {isCopied ? <Check className="size-[11px]" aria-hidden="true" /> : <Copy className="size-[11px]" aria-hidden="true" />}
                  {isCopied ? "Copied" : "Copy"}
                </span>
              </button>
              <span className="sr-only" aria-live="polite">{isCopied ? "Email address copied to clipboard" : ""}</span>
            </div>
          </section>
        </div>,
        document.body,
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
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
        aria-expanded={isOpen}
        className="grid size-8 place-items-center rounded-full text-white transition hover:bg-white/15 active:scale-95"
      >
        <Coffee className="size-4" strokeWidth={2} />
      </button>

      {isOpen && createPortal(
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
        </div>,
        document.body,
      )}
    </>
  );
}

export function TopBar() {
  return (
    <nav
      aria-label="Radio status and actions"
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-2 px-3 pt-4 text-shadow-sm sm:grid sm:grid-cols-[1fr_auto_1fr] sm:justify-normal sm:px-5"
    >
      <div className="hidden sm:flex sm:justify-start">
        <Clock />
      </div>

      <div className="flex justify-center">
        <CountdownPill />
      </div>

      <div className="flex justify-end sm:flex">
        <div className="pointer-events-auto flex items-center gap-2">
          <PlaylistLinks />
          <div className="box-border flex h-11 shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/[0.07] p-1.5 text-white shadow-[0_6px_18px_rgba(0,0,0,0.08)] backdrop-blur-2xl backdrop-saturate-150">
            <BuilderDialogButton />
            <SupportDialogButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
