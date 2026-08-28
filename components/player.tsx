"use client";

import { track as trackEvent } from "@vercel/analytics";
import { useCallback, useEffect, useRef, useState } from "react";
import { NextIcon, PauseIcon, PlayIcon, PreviousIcon } from "@/components/icons";
import { PLAYLISTS, type Track } from "@/lib/tracks";

const GLASS = "border border-white/10 bg-gradient-to-b from-white/[0.15] to-white/[0.055] backdrop-blur-3xl backdrop-saturate-[1.7] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)]";

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

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function Vinyl({ isPlaying, size }: { isPlaying: boolean; size: "desktop" | "mobile" }) {
  return (
    <div
      className={`vinyl-grooves relative shrink-0 overflow-hidden rounded-full ring-1 ring-white/20 ${size === "desktop" ? "size-20" : "size-16"}`}
      style={{ animation: "spin 8s linear infinite", animationPlayState: isPlaying ? "running" : "paused" }}
      aria-hidden="true"
    >
      <div className="absolute inset-[24%] rounded-full bg-gradient-to-br from-pujo-light via-pujo to-[#a9411d] shadow-inner" />
      <div className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 ring-2 ring-white/40" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
    </div>
  );
}

function TrackDetails({ track, compact = false }: { track: Track | null; compact?: boolean }) {
  return (
    <div className="min-w-0">
      <p className={`${compact ? "text-[14px]" : "text-[15px]"} truncate font-semibold tracking-[-0.01em] text-white`}>
        {track?.title ?? "Your songs belong here"}
      </p>
      <p className={`${compact ? "text-[12px]" : "text-[12.5px]"} mt-0.5 truncate text-white/70`}>
        {track ? `${track.artist} · ${track.film}, ${track.year}` : "Add a rights-cleared YouTube upload"}
      </p>
    </div>
  );
}

type SeekBarProps = {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  disabled?: boolean;
};

function SeekBar({ currentTime, duration, onSeek, disabled }: SeekBarProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const percent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const updateFromPointer = useCallback((clientX: number) => {
    const rail = railRef.current;
    if (!rail || disabled || duration <= 0) return;
    const bounds = rail.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width));
    onSeek(ratio * duration);
  }, [disabled, duration, onSeek]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromPointer(event.clientX);
  };

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
      className={`group flex h-6 w-full touch-none items-center ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === "ArrowRight") onSeek(Math.min(duration, currentTime + 5));
        if (event.key === "ArrowLeft") onSeek(Math.max(0, currentTime - 5));
      }}
    >
      <div className="relative h-[3px] w-full rounded-full bg-white/15">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-pujo-light shadow-[0_0_9px_rgba(255,190,86,0.8)]"
          style={{ width: `${percent}%` }}
        />
        <span
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-[0_0_8px_rgba(255,190,86,0.9)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{ left: `${percent}%` }}
        />
      </div>
    </div>
  );
}

type TransportProps = {
  isPlaying: boolean;
  disabled: boolean;
  onPrevious: () => void;
  onToggle: () => void;
  onNext: () => void;
};

function Transport({ isPlaying, disabled, onPrevious, onToggle, onNext }: TransportProps) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-1.5">
      <button type="button" onClick={onPrevious} disabled={disabled} aria-label="Previous track" className="grid size-11 place-items-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
        <PreviousIcon className="size-4" />
      </button>
      <button type="button" onClick={onToggle} disabled={disabled} aria-label={isPlaying ? "Pause" : "Play"} className="grid size-[52px] place-items-center rounded-full bg-gradient-to-b from-pujo-light to-pujo text-[#3b1d08] ring-1 ring-white/25 drop-shadow-[0_8px_16px_rgba(244,165,58,0.38)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-45">
        {isPlaying ? <PauseIcon className="size-[18px]" /> : <PlayIcon className="ml-0.5 size-[19px]" />}
      </button>
      <button type="button" onClick={onNext} disabled={disabled} aria-label="Next track" className="grid size-11 place-items-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
        <NextIcon className="size-4" />
      </button>
    </div>
  );
}

function VideoStage({ hostRef, track }: { hostRef: React.RefObject<HTMLDivElement | null>; track: Track }) {
  return (
    <div className={`${GLASS} mb-3 overflow-hidden rounded-[22px] p-1.5 sm:rounded-[28px] sm:p-2`}>
      <div className="relative aspect-video min-h-[200px] w-full overflow-hidden rounded-[17px] bg-black sm:rounded-[22px]">
        <div ref={hostRef} className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-4 pb-8 pt-3">
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/70">Now showing</span>
          <span className="rounded-full bg-black/35 px-2 py-1 text-[9px] text-white/70 backdrop-blur-sm">YouTube</span>
        </div>
      </div>
      <p className="sr-only">Visible YouTube player for {track.title} by {track.artist}</p>
    </div>
  );
}

function PlaylistSwitch({ activeIndex, onChange }: { activeIndex: number; onChange: (index: number) => void }) {
  return (
    <div className="mb-3 flex justify-center">
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/20 p-1 backdrop-blur-xl" role="tablist" aria-label="Playlists">
        {PLAYLISTS.map((playlist, index) => (
          <button
            key={playlist.id}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            onClick={() => onChange(index)}
            className={`rounded-full px-3 py-2 text-[10px] font-semibold tracking-[0.04em] transition sm:px-4 ${activeIndex === index ? "bg-white/16 text-white shadow-sm" : "text-white/55 hover:text-white"}`}
          >
            {playlist.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Player() {
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const advanceRef = useRef<() => void>(() => undefined);

  const playlist = PLAYLISTS[playlistIndex];
  const currentTrack = playlist.tracks[trackIndex] ?? null;

  const next = useCallback(() => {
    if (!playlist.tracks.length) return;
    setTrackIndex((index) => (index + 1) % playlist.tracks.length);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [playlist.tracks.length]);

  const previous = useCallback(() => {
    if (!playlist.tracks.length) return;
    if (currentTime > 4) {
      playerRef.current?.seekTo(0, true);
      setCurrentTime(0);
      return;
    }
    setTrackIndex((index) => (index - 1 + playlist.tracks.length) % playlist.tracks.length);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [currentTime, playlist.tracks.length]);

  useEffect(() => { advanceRef.current = next; }, [next]);

  useEffect(() => {
    if (!currentTrack || !playerHostRef.current) return;
    let cancelled = false;
    let instance: YouTubePlayer | null = null;

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT || !playerHostRef.current) return;
      instance = new window.YT.Player(playerHostRef.current, {
        videoId: currentTrack.videoId,
        width: "100%",
        height: "100%",
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: ({ target }) => {
            playerRef.current = target;
            const videoDuration = target.getDuration();
            setDuration(videoDuration || currentTrack.duration);
          },
          onStateChange: ({ data, target }) => {
            if (data === 1) {
              setIsPlaying(true);
              setDuration(target.getDuration() || currentTrack.duration);
            } else if (data === 2) {
              setIsPlaying(false);
            } else if (data === 0) {
              setIsPlaying(false);
              advanceRef.current();
            }
          },
          onError: ({ data }) => {
            setIsPlaying(false);
            trackEvent("youtube_player_error", { code: data, videoId: currentTrack.videoId });
            advanceRef.current();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (playerRef.current === instance) playerRef.current = null;
      instance?.destroy();
    };
  }, [currentTrack]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrentTime(player.getCurrentTime() || 0);
      setDuration(player.getDuration() || currentTrack?.duration || 0);
    }, 400);
    return () => window.clearInterval(timer);
  }, [isPlaying, currentTrack?.duration]);

  const switchPlaylist = (index: number) => {
    if (index === playlistIndex) return;
    playerRef.current?.pauseVideo();
    setPlaylistIndex(index);
    setTrackIndex(0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) player.pauseVideo();
    else player.playVideo();
  };

  const seek = useCallback((time: number) => {
    playerRef.current?.seekTo(time, true);
    setCurrentTime(time);
  }, []);

  return (
    <div className="pointer-events-auto w-full max-w-xl">
      <div className="mb-2 text-center drop-shadow-md">
        <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-pujo-light/90">{playlist.eyebrow}</p>
        <p className="mt-1 font-serif text-sm italic text-white/70">Songs that feel like coming home</p>
      </div>

      <PlaylistSwitch activeIndex={playlistIndex} onChange={switchPlaylist} />
      {currentTrack && <VideoStage hostRef={playerHostRef} track={currentTrack} />}

      <div className={`${GLASS} hidden items-center gap-4 rounded-full p-3 pr-5 sm:flex`}>
        <Vinyl isPlaying={isPlaying} size="desktop" />
        <div className="min-w-0 flex-1">
          <TrackDetails track={currentTrack} />
          <SeekBar currentTime={currentTime} duration={duration || currentTrack?.duration || 0} onSeek={seek} disabled={!currentTrack} />
          <div className="-mt-1 flex justify-between text-[10.5px] font-medium tabular-nums text-white/55">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || currentTrack?.duration || 0)}</span>
          </div>
        </div>
        <Transport isPlaying={isPlaying} disabled={!currentTrack} onPrevious={previous} onToggle={togglePlayback} onNext={next} />
      </div>

      <div className={`${GLASS} rounded-[26px] p-4 sm:hidden`}>
        <div className="flex items-center gap-3.5">
          <Vinyl isPlaying={isPlaying} size="mobile" />
          <div className="min-w-0 flex-1"><TrackDetails track={currentTrack} compact /></div>
        </div>
        <div className="mt-2"><SeekBar currentTime={currentTime} duration={duration || currentTrack?.duration || 0} onSeek={seek} disabled={!currentTrack} /></div>
        <div className="relative -mt-0.5 flex min-h-13 items-center justify-center">
          <div className="absolute left-0 flex gap-1 text-[10.5px] font-medium tabular-nums text-white/55">
            <span>{formatTime(currentTime)}</span><span className="text-white/25">/</span><span>{formatTime(duration || currentTrack?.duration || 0)}</span>
          </div>
          <Transport isPlaying={isPlaying} disabled={!currentTrack} onPrevious={previous} onToggle={togglePlayback} onNext={next} />
        </div>
      </div>
    </div>
  );
}
