"use client";

import { track as trackEvent } from "@vercel/analytics";
import { Music2, Repeat, Shuffle, SkipBack, SkipForward, X } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { APPROVED_YOUTUBE_PLAYLIST, PLAYLISTS } from "@/lib/tracks";
import { PUJO_PLAYLIST, type PujoPlaylistTrack } from "@/src/data/pujo-playlist";

const PLAYER_GLASS = "border border-white/15 bg-white/[0.07] shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl backdrop-saturate-150 [-webkit-backdrop-filter:blur(40px)_saturate(150%)]";
const CHIP_GLASS = "border border-white/25 bg-[rgba(161,111,103,0.48)] shadow-[0_8px_24px_rgba(60,32,24,0.16)] backdrop-blur-[18px]";

function ModernPlayIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor"><path d="M8.35 6.42c0-1.24 1.36-2 2.42-1.35l8.16 5.08a1.59 1.59 0 0 1 0 2.7l-8.16 5.08c-1.06.65-2.42-.11-2.42-1.35V6.42Z" /></svg>;
}

function ModernPauseIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor"><rect x="6.75" y="5" width="3.6" height="14" rx="1.4" /><rect x="13.65" y="5" width="3.6" height="14" rx="1.4" /></svg>;
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeApi() {
  if (typeof window === "undefined" || window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

function durationToSeconds(duration: string) {
  return duration.split(":").map(Number).reduce((total, value) => total * 60 + value, 0);
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

function getRandomTrackIndex(currentIndex: number) {
  if (PUJO_PLAYLIST.length < 2) return 0;
  let nextIndex = currentIndex;
  while (nextIndex === currentIndex) nextIndex = Math.floor(Math.random() * PUJO_PLAYLIST.length);
  return nextIndex;
}

function TrackDetails({ track }: { track: PujoPlaylistTrack }) {
  return <div className="min-w-0"><p className="truncate text-[13px] font-bold leading-tight tracking-[-0.01em] text-[#fff7ef] md:text-[14px]">{track.title}</p><p className="mt-1 truncate text-[11px] font-medium leading-tight text-[rgba(255,247,239,0.72)]">{track.channelName}</p></div>;
}

type SeekBarProps = { currentTime: number; duration: number; onSeek: (time: number) => void; disabled?: boolean };

function SeekBar({ currentTime, duration, onSeek, disabled }: SeekBarProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const percent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const updateFromPointer = useCallback((clientX: number) => {
    const rail = railRef.current;
    if (!rail || disabled || duration <= 0) return;
    const bounds = rail.getBoundingClientRect();
    onSeek(Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width)) * duration);
  }, [disabled, duration, onSeek]);

  return (
    <div
      ref={railRef}
      role="slider"
      aria-label="Seek through track"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(currentTime)}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={`group/bar relative h-2 w-full touch-none ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
      onPointerDown={(event) => { if (!disabled) { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); updateFromPointer(event.clientX); } }}
      onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromPointer(event.clientX); }}
      onKeyDown={(event) => { if (!disabled && event.key === "ArrowRight") onSeek(Math.min(duration, currentTime + 5)); if (!disabled && event.key === "ArrowLeft") onSeek(Math.max(0, currentTime - 5)); }}
    >
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-sm bg-white/20">
        <div className="h-full rounded-sm bg-white/90" style={{ width: `${percent}%` }} />
      </div>
      <span className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-white opacity-0 shadow transition-opacity group-hover/bar:opacity-100 group-focus-visible/bar:opacity-100" style={{ left: `${percent}%` }} />
    </div>
  );
}

type TransportProps = { isPlaying: boolean; isRepeating: boolean; isShuffling: boolean; disabled: boolean; onPrevious: () => void; onToggle: () => void; onNext: () => void; onRepeat: () => void; onShuffle: () => void };

function PrimaryTransport({ isPlaying, disabled, onPrevious, onToggle, onNext }: Pick<TransportProps, "isPlaying" | "disabled" | "onPrevious" | "onToggle" | "onNext">) {
  const utilityButton = "grid size-8 place-items-center rounded-xl border-0 bg-transparent p-0 text-white/80 transition hover:bg-white/15 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30";
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" onClick={onPrevious} disabled={disabled} aria-label="Previous track" className={utilityButton}><SkipBack className="size-4" fill="currentColor" strokeWidth={1.8} /></button>
      <button type="button" onClick={onToggle} disabled={disabled} aria-label={isPlaying ? "Pause" : "Play"} aria-pressed={isPlaying} className="grid size-9 place-items-center rounded-xl border-0 bg-white text-black shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50">{isPlaying ? <ModernPauseIcon className="size-4" /> : <ModernPlayIcon className="size-4" />}</button>
      <button type="button" onClick={onNext} disabled={disabled} aria-label="Next track" className={utilityButton}><SkipForward className="size-4" fill="currentColor" strokeWidth={1.8} /></button>
    </div>
  );
}

function DesktopTransport(props: TransportProps) {
  const utilityButton = "grid size-8 place-items-center rounded-xl border-0 bg-transparent p-0 text-white/80 transition-colors hover:bg-white/15 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30";
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" onClick={props.onShuffle} disabled={props.disabled} aria-label={props.isShuffling ? "Shuffle on" : "Shuffle off"} aria-pressed={props.isShuffling} className={`${utilityButton} ${props.isShuffling ? "bg-white/15 text-white" : ""}`}><Shuffle className="size-3.5" strokeWidth={2.2} /></button>
      <PrimaryTransport isPlaying={props.isPlaying} disabled={props.disabled} onPrevious={props.onPrevious} onToggle={props.onToggle} onNext={props.onNext} />
      <button type="button" onClick={props.onRepeat} disabled={props.disabled} aria-label={props.isRepeating ? "Repeat on" : "Repeat off"} aria-pressed={props.isRepeating} className={`${utilityButton} ${props.isRepeating ? "bg-white/15 text-white" : ""}`}><Repeat className="size-3.5" strokeWidth={2.2} /></button>
    </div>
  );
}

type PlayerCardProps = TransportProps & { currentTime: number; duration: number; isDhakActive: boolean; isReady: boolean; track: PujoPlaylistTrack; onDhak: () => void; onSeek: (time: number) => void };

function PlayerCard({ currentTime, duration, isDhakActive, isPlaying, isRepeating, isReady, isShuffling, track, onDhak, onNext, onPrevious, onSeek, onRepeat, onShuffle, onToggle }: PlayerCardProps) {
  const mobileAction = "flex min-w-0 flex-1 items-center justify-center gap-1.5 border-0 bg-transparent px-0.5 py-3 text-white/80 transition hover:bg-white/[0.06] hover:text-white active:scale-95";
  return (
    <div className={`${PLAYER_GLASS} group relative overflow-hidden rounded-3xl`}>
      <div className="flex items-stretch gap-3 p-3 sm:hidden">
        <div className="w-16 shrink-0 overflow-hidden rounded-xl shadow-lg ring-1 ring-white/20"><img src={track.thumbnail} alt={`${track.title} artwork`} loading="eager" className="h-full w-full object-cover object-center" /></div>
        <div className="flex min-w-0 flex-1 flex-col justify-center"><TrackDetails track={track} /><div className="mt-1.5"><SeekBar currentTime={currentTime} duration={duration} onSeek={onSeek} disabled={!isReady} /><div className="mt-1 text-left text-[10px] tabular-nums text-white/60">{formatTime(currentTime)} / {track.duration}</div></div></div>
        <PrimaryTransport isPlaying={isPlaying} disabled={!isReady} onPrevious={onPrevious} onToggle={onToggle} onNext={onNext} />
      </div>

      <div className="hidden items-center gap-3.5 p-3 pr-3.5 sm:flex">
        <div className="size-[66px] shrink-0 overflow-hidden rounded-xl shadow-lg ring-1 ring-white/20"><img src={track.thumbnail} alt={`${track.title} artwork`} loading="eager" className="h-full w-full object-cover object-center" /></div>
        <div className="min-w-0 flex-1"><TrackDetails track={track} /><div className="mt-1.5"><SeekBar currentTime={currentTime} duration={duration} onSeek={onSeek} disabled={!isReady} /><div className="mt-1 text-left text-[10px] tabular-nums text-white/60">{formatTime(currentTime)} / {track.duration}</div></div></div>
        <DesktopTransport isPlaying={isPlaying} isRepeating={isRepeating} isShuffling={isShuffling} disabled={!isReady} onPrevious={onPrevious} onToggle={onToggle} onNext={onNext} onRepeat={onRepeat} onShuffle={onShuffle} />
      </div>

      <div className="flex divide-x divide-white/10 border-t border-white/10 sm:hidden">
        <button type="button" onClick={onShuffle} aria-label={isShuffling ? "Shuffle on" : "Shuffle off"} aria-pressed={isShuffling} className={`${mobileAction} ${isShuffling ? "bg-white/[0.08] text-white" : ""}`}><Shuffle className="size-4" strokeWidth={2.2} /><span className="whitespace-nowrap text-[11px]">Shuffle</span></button>
        <button type="button" onClick={onRepeat} aria-label={isRepeating ? "Repeat on" : "Repeat off"} aria-pressed={isRepeating} className={`${mobileAction} ${isRepeating ? "bg-white/[0.08] text-white" : ""}`}><Repeat className="size-4" strokeWidth={2.2} /><span className="whitespace-nowrap text-[11px]">Repeat</span></button>
        <button type="button" onClick={onDhak} aria-label="Select Dhak" aria-pressed={isDhakActive} className={`${mobileAction} ${isDhakActive ? "bg-white/[0.08] text-white" : ""}`}><Music2 className="size-4" strokeWidth={2.2} /><span className="whitespace-nowrap text-[11px]">Dhak</span></button>
      </div>
    </div>
  );
}

function PlaylistChips({ activeIndex, onChange, onOpenPlaylist }: { activeIndex: number; onChange: (index: number) => void; onOpenPlaylist: () => void }) {
  return <div className="mb-3 flex justify-center"><div className="flex items-center gap-2" role="tablist" aria-label="Playlists">{PLAYLISTS.map((playlist, index) => <button key={playlist.id} type="button" role="tab" aria-selected={activeIndex === index} onClick={() => { onChange(index); if (playlist.id === "pujo-radio") onOpenPlaylist(); }} className={`${CHIP_GLASS} rounded-full px-4 py-2 text-[11px] font-semibold tracking-normal transition hover:border-white/40 hover:bg-white/[0.16] ${activeIndex === index ? "text-white" : "text-white/70"}`}>{playlist.label}</button>)}</div></div>;
}

type PlaylistModalProps = { currentTrackIndex: number; isOpen: boolean; onClose: () => void; onSelectTrack: (index: number) => void };

const PlaylistModal = memo(function PlaylistModal({ currentTrackIndex, isOpen, onClose, onSelectTrack }: PlaylistModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeyDown); };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 max-[520px]:p-3" role="dialog" aria-modal="true" aria-labelledby="playlist-dialog-title">
      <button type="button" className="animate-overlay-fade-in absolute inset-0 cursor-default border-0 bg-black/[0.65] backdrop-blur-[18px] [-webkit-backdrop-filter:blur(18px)]" aria-label="Close playlist" onClick={onClose} />
      <section className="playlist-dialog-glass animate-overlay-scale-in relative flex max-h-[85dvh] w-[min(640px,calc(100vw-32px))] flex-col overflow-hidden rounded-[32px] max-[520px]:max-h-[82dvh] max-[520px]:w-[calc(100vw-24px)] max-[520px]:rounded-[26px]">
        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.10] px-6 py-[18px] max-[520px]:px-[18px] max-[520px]:py-4"><h2 id="playlist-dialog-title" className="text-[13px] font-extrabold uppercase tracking-[0.22em] text-white/70">Playlists</h2><button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close playlist" className="grid size-9 place-items-center rounded-full border-0 bg-transparent text-white/70 transition-colors hover:bg-white/10 hover:text-white"><X className="size-[18px]" strokeWidth={1.8} /></button></header>
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4 max-[520px]:px-3 max-[520px]:pb-3">
          <div className="grid shrink-0 grid-cols-3 gap-2" role="tablist" aria-label="Playlist categories">{[{ label: "Durga Puja", disabled: false }, { label: "Mahalaya", disabled: true }, { label: "Mahalaya Songs", disabled: true }].map((tab) => <button key={tab.label} type="button" role="tab" aria-selected={!tab.disabled} disabled={tab.disabled} className={`min-w-0 rounded-full px-2 py-2 text-[11px] font-extrabold uppercase tracking-[0.04em] transition-colors max-[420px]:text-[10px] ${tab.disabled ? "cursor-default bg-transparent text-white/45" : "bg-white/[0.16] text-white"}`}><span className="block truncate">{tab.label}</span></button>)}</div>
          <p className="shrink-0 px-1 pb-3 pt-3 text-[12px] font-medium text-white/50 max-[520px]:text-[11px]">The main curated Durga Puja playlist.</p>
          <div className="playlist-modal-scrollbar min-h-0 flex-1 overflow-y-auto pr-1"><div className="space-y-1">{PUJO_PLAYLIST.map((track, index) => {
            const isActive = index === currentTrackIndex;
            return <button key={track.videoId} type="button" onClick={() => onSelectTrack(index)} aria-label={`Play ${track.title}`} aria-current={isActive ? "true" : undefined} className={`group flex w-full items-center gap-3 rounded-[18px] border-0 px-3 py-2.5 text-left transition-colors ${isActive ? "bg-white/[0.12]" : "bg-transparent hover:bg-white/[0.08]"}`}>
              <span className={`w-7 shrink-0 text-right text-[12px] font-semibold tabular-nums ${isActive ? "text-[#f1d449]" : "text-white/45"}`}>{String(index + 1).padStart(2, "0")}</span>
              <img src={track.thumbnail} alt="" loading={isActive ? "eager" : "lazy"} className="size-11 shrink-0 rounded-[9px] object-cover object-center shadow-[0_7px_16px_rgba(0,0,0,0.2)]" />
              <span className="min-w-0 flex-1"><span className={`block truncate text-[13px] font-bold ${isActive ? "text-[#f1d449]" : "text-white"}`}>{track.title}</span><span className="mt-0.5 block truncate text-[11px] font-medium text-white/[0.58]">{track.channelName}</span></span>
              <span className="shrink-0 text-[11px] font-medium tabular-nums text-white/[0.42] max-[379px]:hidden">{track.duration}</span>
            </button>;
          })}</div></div>
        </div>
      </section>
    </div>,
    document.body,
  );
});

export function Player() {
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const currentTrackIndexRef = useRef(0);
  const playlistLoadedRef = useRef(false);
  const shouldResumeRef = useRef(false);
  const isRepeatingRef = useRef(false);
  const isShufflingRef = useRef(false);
  const currentTrack = PUJO_PLAYLIST[currentTrackIndex];
  const duration = durationToSeconds(currentTrack.duration);

  const loadTrack = useCallback((index: number, autoplay: boolean) => {
    const normalizedIndex = ((index % PUJO_PLAYLIST.length) + PUJO_PLAYLIST.length) % PUJO_PLAYLIST.length;
    const track = PUJO_PLAYLIST[normalizedIndex];
    currentTrackIndexRef.current = normalizedIndex;
    setCurrentTrackIndex(normalizedIndex);
    setCurrentTime(0);
    shouldResumeRef.current = autoplay;
    const player = playerRef.current;
    if (!player) { setIsPlaying(false); return; }
    playlistLoadedRef.current = true;
    if (autoplay) { player.loadVideoById(track.videoId); setIsPlaying(true); }
    else { player.cueVideoById(track.videoId); setIsPlaying(false); }
  }, []);

  const syncFromPlayer = useCallback(() => {
    const maxDuration = durationToSeconds(PUJO_PLAYLIST[currentTrackIndexRef.current].duration);
    setCurrentTime(Math.min(playerRef.current?.getCurrentTime() ?? 0, maxDuration));
  }, []);

  const next = useCallback(() => {
    const index = currentTrackIndexRef.current;
    loadTrack(isShufflingRef.current ? getRandomTrackIndex(index) : (index + 1) % PUJO_PLAYLIST.length, isPlaying);
  }, [isPlaying, loadTrack]);

  const previous = useCallback(() => {
    if (playerRef.current && currentTime > 4) { playerRef.current.seekTo(0, true); setCurrentTime(0); return; }
    const index = currentTrackIndexRef.current;
    loadTrack(isShufflingRef.current ? getRandomTrackIndex(index) : (index - 1 + PUJO_PLAYLIST.length) % PUJO_PLAYLIST.length, isPlaying);
  }, [currentTime, isPlaying, loadTrack]);

  useEffect(() => {
    if (!playerHostRef.current) return;
    let cancelled = false;
    let instance: YouTubePlayer | null = null;
    setIsReady(false);
    setCurrentTime(0);
    playlistLoadedRef.current = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT || !playerHostRef.current) return;
      instance = new window.YT.Player(playerHostRef.current, {
        videoId: PUJO_PLAYLIST[0].videoId,
        width: 0,
        height: 0,
        playerVars: { modestbranding: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: ({ target }) => {
            playerRef.current = target;
            const track = PUJO_PLAYLIST[currentTrackIndexRef.current];
            playlistLoadedRef.current = true;
            if (shouldResumeRef.current) target.loadVideoById(track.videoId); else target.cueVideoById(track.videoId);
            setIsReady(true);
          },
          onStateChange: ({ data }) => {
            syncFromPlayer();
            if (data === 1) { shouldResumeRef.current = true; setIsPlaying(true); }
            else if (data === 2) { shouldResumeRef.current = false; setIsPlaying(false); }
            else if (data === 0) {
              const index = currentTrackIndexRef.current;
              if (isShufflingRef.current) loadTrack(getRandomTrackIndex(index), true);
              else if (index < PUJO_PLAYLIST.length - 1) loadTrack(index + 1, true);
              else if (isRepeatingRef.current) loadTrack(0, true);
              else { shouldResumeRef.current = false; setCurrentTime(durationToSeconds(PUJO_PLAYLIST[index].duration)); setIsPlaying(false); }
            }
          },
          onError: ({ data }) => {
            const index = currentTrackIndexRef.current;
            const track = PUJO_PLAYLIST[index];
            const shouldContinue = shouldResumeRef.current;
            trackEvent("youtube_playlist_error", { code: data, videoId: track.videoId, playlistId: APPROVED_YOUTUBE_PLAYLIST.id });
            if (index < PUJO_PLAYLIST.length - 1 || isRepeatingRef.current || isShufflingRef.current) loadTrack(isShufflingRef.current ? getRandomTrackIndex(index) : (index + 1) % PUJO_PLAYLIST.length, shouldContinue);
            else setIsPlaying(false);
          },
        },
      });
    });

    return () => { cancelled = true; if (playerRef.current === instance) playerRef.current = null; instance?.destroy(); };
  }, [loadTrack, syncFromPlayer]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(syncFromPlayer, 400);
    return () => window.clearInterval(timer);
  }, [isPlaying, syncFromPlayer]);

  const closePlaylist = useCallback(() => setIsPlaylistOpen(false), []);
  const openPlaylist = useCallback(() => setIsPlaylistOpen(true), []);
  const selectPlaylistTrack = useCallback((index: number) => { loadTrack(index, true); if (window.matchMedia("(max-width: 767px)").matches) closePlaylist(); }, [closePlaylist, loadTrack]);
  const togglePlayback = () => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) { shouldResumeRef.current = false; player.pauseVideo(); }
    else if (!playlistLoadedRef.current) loadTrack(currentTrackIndexRef.current, true);
    else { shouldResumeRef.current = true; player.playVideo(); }
  };
  const seek = useCallback((time: number) => { playerRef.current?.seekTo(time, true); setCurrentTime(time); }, []);
  const toggleShuffle = () => { const value = !isShufflingRef.current; isShufflingRef.current = value; setIsShuffling(value); };
  const toggleRepeat = () => { const value = !isRepeatingRef.current; isRepeatingRef.current = value; setIsRepeating(value); };
  const playlist = PLAYLISTS[playlistIndex];

  return (
    <div className="pointer-events-auto w-full">
      <div className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true"><div ref={playerHostRef} /></div>
      <div className="mb-3 text-center drop-shadow-sm"><p className="text-[9px] font-bold uppercase tracking-[0.24em] text-pujo-light/95">{playlist.eyebrow}</p></div>
      <PlaylistChips activeIndex={playlistIndex} onChange={setPlaylistIndex} onOpenPlaylist={openPlaylist} />
      <PlaylistModal currentTrackIndex={currentTrackIndex} isOpen={isPlaylistOpen} onClose={closePlaylist} onSelectTrack={selectPlaylistTrack} />
      <PlayerCard currentTime={currentTime} duration={duration} isDhakActive={playlistIndex === 1} isPlaying={isPlaying} isRepeating={isRepeating} isReady={isReady} isShuffling={isShuffling} track={currentTrack} onDhak={() => setPlaylistIndex(1)} onPrevious={previous} onToggle={togglePlayback} onNext={next} onSeek={seek} onRepeat={toggleRepeat} onShuffle={toggleShuffle} disabled={!isReady} />
    </div>
  );
}
