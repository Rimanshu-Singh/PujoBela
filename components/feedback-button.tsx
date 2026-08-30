"use client";

import { track as trackEvent } from "@vercel/analytics";
import { MessageCircle, Send, Star, X } from "lucide-react";
import { FormEvent, useEffect, useId, useRef, useState } from "react";

const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLScxOPGozqJEzKT9Ms7w2Nq7yJEx_wDE5NjLcIVzSqv7TIEtxA/formResponse";

const GOOGLE_FORM_FIELDS = {
  name: "entry.1487132209",
  rating: "entry.180893014",
  feedback: "entry.1354945778",
} as const;

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const nameId = useId();
  const messageId = useId();

  useEffect(() => {
    if (!isOpen) return;

    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        window.setTimeout(() => triggerRef.current?.focus(), 0);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedFeedback = feedback.trim();

    if (!trimmedName || rating === 0 || !trimmedFeedback) {
      setErrorMessage("Please add your name, rating, and feedback.");
      setStatus("error");
      return;
    }

    const formData = new FormData();
    formData.append(GOOGLE_FORM_FIELDS.name, trimmedName);
    formData.append(GOOGLE_FORM_FIELDS.rating, String(rating));
    formData.append(GOOGLE_FORM_FIELDS.feedback, trimmedFeedback);

    setIsSending(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      await fetch(GOOGLE_FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      trackEvent("feedback_submitted", {
        rating,
        messageLength: trimmedFeedback.length,
      });
      setName("");
      setFeedback("");
      setRating(0);
      setStatus("sent");
    } catch {
      setErrorMessage("Could not send feedback. Please try again.");
      setStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setStatus("idle");
          setErrorMessage("");
          setIsOpen(true);
        }}
        aria-label="Send feedback"
        aria-haspopup="dialog"
        className="fixed bottom-[calc(112px+env(safe-area-inset-bottom))] right-[14px] z-30 grid size-[46px] place-items-center rounded-2xl border border-white/[0.28] bg-white/[0.22] text-white shadow-[0_12px_32px_rgba(45,22,12,0.2)] backdrop-blur-[18px] backdrop-saturate-[1.6] transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.32] focus-visible:-translate-y-0.5 md:bottom-7 md:right-6"
      >
        <MessageCircle className="size-5" strokeWidth={1.9} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center overflow-y-auto bg-[#1c0d08]/35 p-3 backdrop-blur-sm"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="max-h-[calc(100dvh-24px)] w-full max-w-[390px] overflow-y-auto rounded-[22px] border border-white/30 bg-[linear-gradient(145deg,rgba(151,99,89,0.88),rgba(91,60,56,0.82))] p-4 text-[#fff8f2] shadow-[0_28px_80px_rgba(38,17,10,0.38),inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-[30px] backdrop-saturate-[1.6]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Pujo Radio</p>
                <h2 id="feedback-title" className="mt-1 text-[18px] font-bold leading-tight tracking-[-0.02em]">Share your feedback</h2>
                <p className="mt-1 text-[11px] leading-relaxed text-white/65">Help us make your Pujo listening experience better.</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={closeModal}
                aria-label="Close feedback form"
                className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                <X className="size-[18px]" />
              </button>
            </div>

            {status === "sent" ? (
              <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 px-4 py-6 text-center">
                <MessageCircle className="mx-auto size-6 text-[#ffe4bd]" />
                <p className="mt-2.5 text-[14px] font-semibold">Thanks for your feedback!</p>
                <button type="button" onClick={closeModal} className="mt-4 rounded-xl bg-white/90 px-5 py-2 text-[12px] font-bold text-[#4a2a22] transition hover:bg-white">
                  Done
                </button>
              </div>
            ) : (
              <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                <label htmlFor={nameId} className="block text-[10px] font-semibold text-white/75">
                  Name
                  <input
                    id={nameId}
                    name="name"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setStatus("idle");
                      setErrorMessage("");
                    }}
                    className="mt-1 h-9 w-full rounded-[10px] border border-white/20 bg-white/10 px-2.5 text-[12px] text-white outline-none placeholder:text-white/35 focus:border-white/45 focus:bg-white/[0.14]"
                    placeholder="Your name"
                  />
                </label>

                <label htmlFor={messageId} className="block text-[10px] font-semibold text-white/75">
                  Feedback message
                  <textarea
                    id={messageId}
                    name="message"
                    required
                    rows={3}
                    value={feedback}
                    onChange={(event) => {
                      setFeedback(event.target.value);
                      setStatus("idle");
                      setErrorMessage("");
                    }}
                    className="mt-1 w-full resize-none rounded-[10px] border border-white/20 bg-white/10 px-2.5 py-2 text-[12px] leading-relaxed text-white outline-none placeholder:text-white/35 focus:border-white/45 focus:bg-white/[0.14]"
                    placeholder="Tell us what you liked or what we can improve…"
                  />
                </label>

                <fieldset>
                  <legend className="text-[10px] font-semibold text-white/75">Rating</legend>
                  <div className="mt-1 flex items-center gap-1" aria-label="Choose a rating from 1 to 5">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setRating(value);
                          setStatus("idle");
                          setErrorMessage("");
                        }}
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        aria-pressed={rating === value}
                        className={`grid size-8 place-items-center rounded-[10px] transition ${value <= rating ? "text-[#ffd36a]" : "text-white/40 hover:text-[#ffe1a8]"}`}
                      >
                        <Star className="size-[18px]" fill={value <= rating ? "currentColor" : "none"} strokeWidth={1.7} />
                      </button>
                    ))}
                  </div>
                </fieldset>

                {status === "error" && (
                  <p role="alert" className="text-[11px] font-semibold text-[#ffe0d6]">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSending}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/[0.94] text-[12px] font-bold text-[#4a2a22] shadow-[0_10px_28px_rgba(45,22,12,0.2)] transition hover:bg-white active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
                >
                  <Send className="size-4" />
                  {isSending ? "Sending…" : "Send Feedback"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
