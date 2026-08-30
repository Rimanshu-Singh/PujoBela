import { FeedbackButton } from "@/components/feedback-button";
import { DynamicBackground } from "@/components/dynamic-background";
import { Player } from "@/components/player";
import { TopBar } from "@/components/top-bar";

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E")`;

export default function Home() {
  return (
    <main className="relative isolate min-h-dvh w-screen overflow-hidden pb-[env(safe-area-inset-bottom)]">
      <DynamicBackground />
      <div
        className="fixed inset-0 -z-10 bg-repeat opacity-20 mix-blend-overlay"
        style={{ backgroundImage: grain, backgroundSize: "180px 180px" }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/10 via-transparent to-[rgba(120,53,20,0.1)]" aria-hidden="true" />
      <div className="site-background-overlay pujo-bg-overlay" aria-hidden="true" />

      <TopBar />

      <section className="pointer-events-none fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-1/2 z-10 w-[calc(100vw-24px)] max-w-[480px] -translate-x-1/2 sm:w-[min(480px,calc(100vw-40px))] md:bottom-[26px] md:w-[min(480px,calc(100vw-32px))]">
        <Player />
      </section>

      <FeedbackButton />
    </main>
  );
}
