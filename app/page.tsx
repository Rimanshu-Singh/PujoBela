import { Player } from "@/components/player";
import { TopBar } from "@/components/top-bar";

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E")`;

export default function Home() {
  return (
    <main className="relative isolate flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden">
      <div className="hero-bg fixed inset-0 -z-20 bg-cover bg-center" aria-hidden="true" />
      <div
        className="fixed inset-0 -z-10 bg-repeat opacity-30 mix-blend-overlay"
        style={{ backgroundImage: grain, backgroundSize: "180px 180px" }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-b from-black/35 via-transparent to-black/80"
        aria-hidden="true"
      />

      <TopBar />

      <section className="pointer-events-none flex min-h-dvh w-full items-end justify-center pb-[calc(max(1rem,env(safe-area-inset-bottom))+1rem)] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-28 sm:justify-end sm:pb-[calc(max(1rem,env(safe-area-inset-bottom))+1.5rem)] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
        <Player />
      </section>
    </main>
  );
}
