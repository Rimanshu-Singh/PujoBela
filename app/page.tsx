import { FeedbackButton } from "@/components/feedback-button";
import { Player } from "@/components/player";
import { TopBar } from "@/components/top-bar";

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E")`;

export default function Home() {
  return (
    <main className="relative isolate min-h-dvh w-screen overflow-hidden pb-[env(safe-area-inset-bottom)]">
      <picture className="hero-bg" aria-hidden="true">
        <source media="(min-width: 768px)" srcSet="/bg/scene-wide.png" />
        <img className="hero-bg-image" src="/bg/scene-tall.png" alt="" />
      </picture>
      <div
        className="fixed inset-0 -z-10 bg-repeat opacity-20 mix-blend-overlay"
        style={{ backgroundImage: grain, backgroundSize: "180px 180px" }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/10 via-transparent to-[rgba(120,53,20,0.1)]" aria-hidden="true" />
      <div className="site-background-overlay pujo-bg-overlay" aria-hidden="true" />

      <TopBar />

      <h1 className="pointer-events-none fixed left-1/2 top-[20dvh] z-[2] w-[min(82vw,22rem)] -translate-x-1/2 text-center text-[clamp(2.65rem,13vw,4rem)] font-bold leading-[0.92] tracking-[-0.04em] text-[#ffd24f] drop-shadow-[0_3px_10px_rgba(111,52,10,0.18)] md:hidden">
        <span className="block">পুজো</span>
        <span className="block">আসছে</span>
      </h1>

      <section className="pointer-events-none fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-1/2 z-10 w-[calc(100vw-24px)] max-w-[560px] -translate-x-1/2 sm:w-[min(560px,calc(100vw-40px))] md:bottom-[26px] md:w-[min(560px,calc(100vw-32px))]">
        <Player />
      </section>

      <FeedbackButton />
    </main>
  );
}
