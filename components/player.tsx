"use client";

import { track as trackEvent } from "@vercel/analytics";
import { Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { APPROVED_YOUTUBE_PLAYLIST, PLAYLISTS } from "@/lib/tracks";

const PLAYER_GLASS = "border border-white/25 bg-[linear-gradient(135deg,rgba(170,115,105,0.58),rgba(120,82,76,0.46))] shadow-[0_18px_45px_rgba(54,28,20,0.24),inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(80,40,30,0.12)] backdrop-blur-[24px] backdrop-saturate-[1.7] [-webkit-backdrop-filter:blur(24px)_saturate(170%)]";
const CHIP_GLASS = "border border-white/25 bg-[rgba(161,111,103,0.48)] shadow-[0_8px_24px_rgba(60,32,24,0.16)] backdrop-blur-[18px]";

type NowPlaying = {
  title: string;
  channelName: string;
  videoId: string;
};

function ModernPlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M8.35 6.42c0-1.24 1.36-2 2.42-1.35l8.16 5.08a1.59 1.59 0 0 1 0 2.7l-8.16 5.08c-1.06.65-2.42-.11-2.42-1.35V6.42Z" />
    </svg>
  );
}

function ModernPauseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <rect x="6.75" y="5" width="3.6" height="14" rx="1.4" />
      <rect x="13.65" y="5" width="3.6" height="14" rx="1.4" />
    </svg>
  );
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

function readNowPlaying(player: YouTubePlayer): NowPlaying {
  const data = player.getVideoData();
  return {
    title: data.title || "Pujo playlist",
    channelName: data.author || "YouTube Music",
    videoId: data.video_id || APPROVED_YOUTUBE_PLAYLIST.startVideoId,
  };
}

function TrackDetails({ nowPlaying }: { nowPlaying: NowPlaying | null }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[13px] font-bold leading-tight tracking-[-0.01em] text-[#fff7ef] md:text-[14px]">
        {nowPlaying?.title ?? "Pujo Radio playlist"}
      </p>
      <p className="mt-1 truncate text-[11px] font-medium leading-tight text-[rgba(255,247,239,0.72)]">
        {nowPlaying?.channelName ?? "YouTube Music"}
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

  const updateFromPointer = useCallback(
    (clientX: number) => {
      const rail = railRef.current;
      if (!rail || disabled || duration <= 0) return;
      const bounds = rail.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width));
      onSeek(ratio * duration);
    },
    [disabled, duration, onSeek],
  );

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
      className={`group relative h-[3px] w-full touch-none rounded-full bg-white/25 md:h-1 ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === "ArrowRight") onSeek(Math.min(duration, currentTime + 5));
        if (event.key === "ArrowLeft") onSeek(Math.max(0, currentTime - 5));
      }}
    >
      <span className="absolute inset-x-0 -inset-y-[10px]" aria-hidden="true" />
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-white/[0.92]"
        style={{ width: `${percent}%` }}
      />
      <span
        className="absolute top-1/2 size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.55)]"
        style={{ left: `${percent}%` }}
      />
    </div>
  );
}

type TransportProps = {
  isPlaying: boolean;
  isRepeating: boolean;
  isShuffling: boolean;
  disabled: boolean;
  onPrevious: () => void;
  onToggle: () => void;
  onNext: () => void;
  onRepeat: () => void;
  onShuffle: () => void;
};

function Transport({ isPlaying, isRepeating, isShuffling, disabled, onPrevious, onToggle, onNext, onRepeat, onShuffle }: TransportProps) {
  const utilityButton = "grid size-6 place-items-center border-0 bg-transparent p-0 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <div className="flex shrink-0 items-center justify-center gap-[5px] min-[380px]:gap-[7px] md:gap-[9px]">
      <button
        type="button"
        onClick={onShuffle}
        disabled={disabled}
        aria-label="Shuffle playlist"
        aria-pressed={isShuffling}
        className={`${utilityButton} hidden text-white/[0.78] min-[380px]:grid ${isShuffling ? "opacity-100" : "opacity-80"}`}
      >
        <Shuffle className="size-[15px]" strokeWidth={2.1} />
      </button>
      <button
        type="button"
        onClick={onPrevious}
        disabled={disabled}
        aria-label="Previous track"
        className={`${utilityButton} text-white/[0.82] opacity-90`}
      >
        <SkipBack className="size-4" fill="currentColor" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="grid size-[38px] place-items-center rounded-xl bg-white/[0.95] text-[#4a2a22] shadow-[0_8px_20px_rgba(40,20,14,0.22),inset_0_1px_0_rgba(255,255,255,0.8)] transition hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isPlaying ? <ModernPauseIcon className="size-[22px]" /> : <ModernPlayIcon className="size-[22px]" />}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        aria-label="Next track"
        className={`${utilityButton} text-white/[0.82] opacity-90`}
      >
        <SkipForward className="size-4" fill="currentColor" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        onClick={onRepeat}
        disabled={disabled}
        aria-label="Repeat playlist"
        aria-pressed={isRepeating}
        className={`${utilityButton} hidden text-white/[0.78] min-[380px]:grid ${isRepeating ? "opacity-100" : "opacity-80"}`}
      >
        <Repeat className="size-[15px]" strokeWidth={2.1} />
      </button>
    </div>
  );
}

function ArtworkSlot({ nowPlaying }: { nowPlaying: NowPlaying | null }) {
  const videoId = nowPlaying?.videoId ?? APPROVED_YOUTUBE_PLAYLIST.startVideoId;
  const title = nowPlaying?.title ?? "Pujo Radio playlist";

  return (
    <div className="relative size-[56px] shrink-0 overflow-hidden rounded-xl bg-white/[0.18] max-[379px]:size-[50px] md:size-[58px]">
      <img
        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
        alt={`${title} thumbnail`}
        className="h-full w-full object-cover object-center"
        onError={(event) => {
          const image = event.currentTarget;
          if (image.dataset.fallbackApplied) return;
          image.dataset.fallbackApplied = "true";
          image.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }}
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.18]" />
    </div>
  );
}

type PlayerCardProps = {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isRepeating: boolean;
  isReady: boolean;
  isShuffling: boolean;
  nowPlaying: NowPlaying | null;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onRepeat: () => void;
  onShuffle: () => void;
  onToggle: () => void;
};

function PlayerCard({ currentTime, duration, isPlaying, isRepeating, isReady, isShuffling, nowPlaying, onNext, onPrevious, onSeek, onRepeat, onShuffle, onToggle }: PlayerCardProps) {
  return (
    <div className={`${PLAYER_GLASS} grid min-h-[82px] grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-[14px] rounded-[20px] p-3 max-[379px]:grid-cols-[50px_minmax(0,1fr)_auto] max-[379px]:gap-2.5 max-[379px]:p-2.5 md:min-h-[100px] md:grid-cols-[58px_minmax(0,1fr)_auto] md:px-[15px] md:py-3`}>
      <ArtworkSlot nowPlaying={nowPlaying} />
      <div className="min-w-0">
        <TrackDetails nowPlaying={nowPlaying} />
        <div className="mt-2.5">
          <SeekBar currentTime={currentTime} duration={duration} onSeek={onSeek} disabled={!isReady} />
          <div className="mt-1 flex w-full justify-between text-[9px] font-semibold tabular-nums text-white/75">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
      <Transport
        isPlaying={isPlaying}
        isRepeating={isRepeating}
        isShuffling={isShuffling}
        disabled={!isReady}
        onPrevious={onPrevious}
        onToggle={onToggle}
        onNext={onNext}
        onRepeat={onRepeat}
        onShuffle={onShuffle}
      />
    </div>
  );
}

function PlaylistChips({ activeIndex, onChange }: { activeIndex: number; onChange: (index: number) => void }) {
  return (
    <div className="mb-3 flex justify-center">
      <div className="flex items-center gap-2" role="tablist" aria-label="Playlists">
        {PLAYLISTS.map((playlist, index) => (
          <button
            key={playlist.id}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            onClick={() => onChange(index)}
            className={`${CHIP_GLASS} rounded-full px-4 py-2 text-[11px] font-semibold tracking-normal transition hover:border-white/40 hover:bg-white/[0.16] ${activeIndex === index ? "text-white" : "text-white/70"}`}
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playlistLoadedRef = useRef(false);
  const nowPlayingRef = useRef<NowPlaying | null>(null);
  const shouldResumeRef = useRef(false);

  const syncFromPlayer = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    const nextNowPlaying = readNowPlaying(player);
    nowPlayingRef.current = nextNowPlaying;
    setNowPlaying(nextNowPlaying);
    setCurrentTime(player.getCurrentTime() || 0);
    setDuration(player.getDuration() || 0);
  }, []);

  const playAfterQueueMove = useCallback(() => {
    window.setTimeout(() => {
      syncFromPlayer();
      if (shouldResumeRef.current) playerRef.current?.playVideo();
    }, 250);
  }, [syncFromPlayer]);

  const next = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    shouldResumeRef.current = isPlaying;
    player.nextVideo();
    setCurrentTime(0);
    playAfterQueueMove();
  }, [isPlaying, playAfterQueueMove]);

  const previous = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    if (currentTime > 4) {
      player.seekTo(0, true);
      setCurrentTime(0);
      return;
    }

    shouldResumeRef.current = isPlaying;
    player.previousVideo();
    setCurrentTime(0);
    playAfterQueueMove();
  }, [currentTime, isPlaying, playAfterQueueMove]);

  useEffect(() => {
    if (!playerHostRef.current) return;
    let cancelled = false;
    let instance: YouTubePlayer | null = null;

    setIsReady(false);
    setNowPlaying(null);
    setCurrentTime(0);
    setDuration(0);
    playlistLoadedRef.current = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT || !playerHostRef.current) return;

      instance = new window.YT.Player(playerHostRef.current, {
        videoId: APPROVED_YOUTUBE_PLAYLIST.startVideoId,
        width: 0,
        height: 0,
        playerVars: {
          index: APPROVED_YOUTUBE_PLAYLIST.startIndex,
          list: APPROVED_YOUTUBE_PLAYLIST.id,
          listType: "playlist",
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: ({ target }) => {
            playerRef.current = target;
            target.cuePlaylist({
              listType: "playlist",
              list: APPROVED_YOUTUBE_PLAYLIST.id,
              index: APPROVED_YOUTUBE_PLAYLIST.startIndex,
            });
            setIsReady(true);
            window.setTimeout(syncFromPlayer, 250);
          },
          onStateChange: ({ data, target }) => {
            syncFromPlayer();
            if (data === 1) {
              shouldResumeRef.current = true;
              setIsPlaying(true);
              setDuration(target.getDuration() || 0);
            } else if (data === 2) {
              shouldResumeRef.current = false;
              setIsPlaying(false);
            } else if (data === 0) {
              setIsPlaying(false);
              shouldResumeRef.current = true;
              target.nextVideo();
              playAfterQueueMove();
            }
          },
          onError: ({ data, target }) => {
            const videoId = target.getVideoData().video_id || nowPlayingRef.current?.videoId || APPROVED_YOUTUBE_PLAYLIST.startVideoId;
            setIsPlaying(false);
            trackEvent("youtube_playlist_error", { code: data, videoId, playlistId: APPROVED_YOUTUBE_PLAYLIST.id });
            const shouldContinue = shouldResumeRef.current;
            target.nextVideo();
            if (shouldContinue) playAfterQueueMove();
            else window.setTimeout(syncFromPlayer, 250);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (playerRef.current === instance) playerRef.current = null;
      instance?.destroy();
    };
  }, [playAfterQueueMove, syncFromPlayer]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(syncFromPlayer, 400);
    return () => window.clearInterval(timer);
  }, [isPlaying, syncFromPlayer]);

  const switchPlaylist = (index: number) => {
    setPlaylistIndex(index);
  };

  const togglePlayback = () => {
    const player = playerRef.current;
    if (!player) return;

    if (isPlaying) {
      shouldResumeRef.current = false;
      player.pauseVideo();
    } else {
      shouldResumeRef.current = true;
      if (!playlistLoadedRef.current) {
        playlistLoadedRef.current = true;
        player.loadPlaylist({
          listType: "playlist",
          list: APPROVED_YOUTUBE_PLAYLIST.id,
          index: APPROVED_YOUTUBE_PLAYLIST.startIndex,
        });
        player.setShuffle(isShuffling);
        player.setLoop(isRepeating);
      } else {
        player.playVideo();
      }
    }
  };

  const seek = useCallback((time: number) => {
    playerRef.current?.seekTo(time, true);
    setCurrentTime(time);
  }, []);

  const toggleShuffle = () => {
    const nextValue = !isShuffling;
    setIsShuffling(nextValue);
    playerRef.current?.setShuffle(nextValue);
  };

  const toggleRepeat = () => {
    const nextValue = !isRepeating;
    setIsRepeating(nextValue);
    playerRef.current?.setLoop(nextValue);
  };

  const playlist = PLAYLISTS[playlistIndex];

  return (
    <div className="pointer-events-auto w-full">
      <div className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
        <div ref={playerHostRef} />
      </div>

      <div className="mb-3 text-center drop-shadow-sm">
        <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-pujo-light/95">{playlist.eyebrow}</p>
      </div>

      <PlaylistChips activeIndex={playlistIndex} onChange={switchPlaylist} />
      <PlayerCard
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        isRepeating={isRepeating}
        isReady={isReady}
        isShuffling={isShuffling}
        nowPlaying={nowPlaying}
        onPrevious={previous}
        onToggle={togglePlayback}
        onNext={next}
        onSeek={seek}
        onRepeat={toggleRepeat}
        onShuffle={toggleShuffle}
      />
    </div>
  );
}
