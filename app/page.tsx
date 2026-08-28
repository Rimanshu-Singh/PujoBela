import { Player } from "@/components/player";
import { TopBar } from "@/components/top-bar";

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E")`;

export default function Home() {
  return (
    <main className="relative isolate min-h-screen w-screen overflow-hidden">
      <div className="hero-bg fixed inset-0 -z-20 h-screen w-screen bg-cover bg-center" aria-hidden="true" />
      <div
        className="fixed inset-0 -z-10 bg-repeat opacity-20 mix-blend-overlay"
        style={{ backgroundImage: grain, backgroundSize: "180px 180px" }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/10 via-transparent to-[rgba(120,53,20,0.1)]" aria-hidden="true" />

      <TopBar />

      <section className="pointer-events-none fixed bottom-5 left-1/2 z-10 w-[calc(100vw-24px)] max-w-[560px] -translate-x-1/2 sm:bottom-12 sm:w-[clamp(360px,38vw,560px)]">
        <Player />
      </section>
    </main>
  );
}
