"use client";

import { track as trackEvent } from "@vercel/analytics";
import { useCallback, useEffect, useRef, useState } from "react";
import { NextIcon, PauseIcon, PlayIcon, PreviousIcon } from "@/components/icons";
import { APPROVED_YOUTUBE_PLAYLIST, PLAYLISTS } from "@/lib/tracks";

const PLAYER_GLASS = "border border-white/[0.22] bg-[rgba(161,111,103,0.72)] shadow-[0_18px_45px_rgba(60,32,24,0.24)] backdrop-blur-[18px]";
const CHIP_GLASS = "border border-white/25 bg-[rgba(161,111,103,0.48)] shadow-[0_8px_24px_rgba(60,32,24,0.16)] backdrop-blur-[18px]";

type NowPlaying = {
  title: string;
  artist: string;
  videoId: string;
};

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
    artist: data.author || "YouTube playlist",
    videoId: data.video_id || APPROVED_YOUTUBE_PLAYLIST.startVideoId,
  };
}

function TrackDetails({ nowPlaying }: { nowPlaying: NowPlaying | null }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[12px] font-bold leading-tight tracking-normal text-white">
        {nowPlaying?.title ?? "Pujo Radio playlist"}
      </p>
      <p className="mt-0.5 truncate text-[10px] font-medium leading-tight text-[#fff2e8]/75">
        {APPROVED_YOUTUBE_PLAYLIST.source}
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
      className={`group flex h-4 w-full touch-none items-center ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === "ArrowRight") onSeek(Math.min(duration, currentTime + 5));
        if (event.key === "ArrowLeft") onSeek(Math.max(0, currentTime - 5));
      }}
    >
      <div className="relative h-[2px] w-full rounded-full bg-white/[0.55]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white"
          style={{ width: `${percent}%` }}
        />
        <span
          className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
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
    <div className="flex shrink-0 items-center justify-center gap-1">
      <button
        type="button"
        onClick={onPrevious}
        disabled={disabled}
        aria-label="Previous track"
        className="grid size-7 place-items-center rounded-full text-white/85 transition hover:bg-white/[0.12] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <PreviousIcon className="size-[14px]" />
      </button>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="grid size-[34px] place-items-center rounded-full bg-white text-[#6f4a43] shadow-[0_6px_14px_rgba(60,32,24,0.18)] transition hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isPlaying ? <PauseIcon className="size-[13px]" /> : <PlayIcon className="ml-0.5 size-[14px]" />}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        aria-label="Next track"
        className="grid size-7 place-items-center rounded-full text-white/85 transition hover:bg-white/[0.12] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <NextIcon className="size-[14px]" />
      </button>
    </div>
  );
}

function ArtworkSlot({ nowPlaying }: { nowPlaying: NowPlaying | null }) {
  const videoId = nowPlaying?.videoId ?? APPROVED_YOUTUBE_PLAYLIST.startVideoId;
  const title = nowPlaying?.title ?? "Pujo Radio playlist";

  return (
    <div className="relative size-[46px] shrink-0 overflow-hidden rounded-lg bg-[#7b514b]/40">
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={`${title} thumbnail`}
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-white/[0.04]" />
    </div>
  );
}

type PlayerCardProps = {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isReady: boolean;
  nowPlaying: NowPlaying | null;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onToggle: () => void;
};

function PlayerCard({ currentTime, duration, isPlaying, isReady, nowPlaying, onNext, onPrevious, onSeek, onToggle }: PlayerCardProps) {
  return (
    <div className={`${PLAYER_GLASS} flex h-auto min-h-[74px] items-center gap-3 rounded-[18px] px-3 py-3 sm:h-[74px] sm:py-0 sm:pr-3.5`}>
      <ArtworkSlot nowPlaying={nowPlaying} />
      <div className="min-w-0 flex-1 pt-0.5">
        <TrackDetails nowPlaying={nowPlaying} />
        <div className="mt-1.5">
          <SeekBar currentTime={currentTime} duration={duration} onSeek={onSeek} disabled={!isReady} />
        </div>
        <div className="-mt-0.5 flex justify-between text-[9px] font-medium tabular-nums text-white/80">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <Transport isPlaying={isPlaying} disabled={!isReady} onPrevious={onPrevious} onToggle={onToggle} onNext={onNext} />
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
  const [isReady, setIsReady] = useState(false);
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
      } else {
        player.playVideo();
      }
    }
  };

  const seek = useCallback((time: number) => {
    playerRef.current?.seekTo(time, true);
    setCurrentTime(time);
  }, []);

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
        isReady={isReady}
        nowPlaying={nowPlaying}
        onPrevious={previous}
        onToggle={togglePlayback}
        onNext={next}
        onSeek={seek}
      />
    </div>
  );
}
