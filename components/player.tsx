"use client";

import { track as trackEvent } from "@vercel/analytics";
import { useCallback, useEffect, useRef, useState } from "react";
import { NextIcon, PauseIcon, PlayIcon, PreviousIcon } from "@/components/icons";
import { APPROVED_YOUTUBE_PLAYLIST, PLAYLISTS } from "@/lib/tracks";

const PLAYER_GLASS = "border border-white/25 bg-[linear-gradient(135deg,rgba(104,42,14,0.42),rgba(226,128,49,0.22)_48%,rgba(72,28,10,0.34))] shadow-[0_18px_44px_-18px_rgba(54,20,4,0.58),inset_0_1px_0_rgba(255,255,255,0.24)] backdrop-blur-3xl backdrop-saturate-[1.55]";
const CHIP_GLASS = "border border-white/25 bg-[linear-gradient(135deg,rgba(124,50,16,0.34),rgba(255,173,88,0.16))] shadow-[0_8px_24px_rgba(54,20,4,0.14)] backdrop-blur-2xl";

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

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

function TrackDetails({ nowPlaying, compact = false }: { nowPlaying: NowPlaying | null; compact?: boolean }) {
  return (
    <div className="min-w-0">
      <p className={`${compact ? "text-[14px]" : "text-[16px]"} truncate font-semibold tracking-normal text-white`}>
        {nowPlaying?.title ?? "Pujo Radio playlist"}
      </p>
      <p className={`${compact ? "text-[12px]" : "text-[13px]"} mt-1 truncate text-white/[0.72]`}>
        {nowPlaying?.artist ?? "Approved YouTube playlist"}
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
      className={`group flex h-6 w-full touch-none items-center ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === "ArrowRight") onSeek(Math.min(duration, currentTime + 5));
        if (event.key === "ArrowLeft") onSeek(Math.max(0, currentTime - 5));
      }}
    >
      <div className="relative h-[4px] w-full rounded-full bg-white/[0.18]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-pujo-light shadow-[0_0_10px_rgba(255,190,86,0.7)]"
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
      <button
        type="button"
        onClick={onPrevious}
        disabled={disabled}
        aria-label="Previous track"
        className="grid size-11 place-items-center rounded-full text-white/[0.78] transition hover:bg-white/[0.12] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <PreviousIcon className="size-4" />
      </button>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="grid size-[52px] place-items-center rounded-full bg-gradient-to-b from-pujo-light to-pujo text-[#3b1d08] ring-1 ring-white/25 drop-shadow-[0_8px_16px_rgba(244,165,58,0.38)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-45"
      >
        {isPlaying ? <PauseIcon className="size-[18px]" /> : <PlayIcon className="ml-0.5 size-[19px]" />}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        aria-label="Next track"
        className="grid size-11 place-items-center rounded-full text-white/[0.78] transition hover:bg-white/[0.12] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <NextIcon className="size-4" />
      </button>
    </div>
  );
}

function ArtworkSlot({ hostRef, hasPlaylist, compact = false }: { hostRef: React.RefObject<HTMLDivElement | null>; hasPlaylist: boolean; compact?: boolean }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-[16px] border border-white/[0.18] bg-[#351309]/55 shadow-inner ${compact ? "aspect-video w-full" : "aspect-video w-[150px]"}`}>
      {hasPlaylist ? (
        <div ref={hostRef} className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full" />
      ) : (
        <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(255,198,103,0.32),transparent_36%),linear-gradient(135deg,rgba(62,22,8,0.88),rgba(160,66,22,0.58))]">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pujo-light">Pujo</p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/65">Radio</p>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/12 via-transparent to-white/10" />
      {hasPlaylist && (
        <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/35 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/[0.72] backdrop-blur-sm">
          YouTube
        </div>
      )}
    </div>
  );
}

type PlayerCardProps = {
  currentTime: number;
  duration: number;
  hostRef: React.RefObject<HTMLDivElement | null>;
  isPlaying: boolean;
  isReady: boolean;
  nowPlaying: NowPlaying | null;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onToggle: () => void;
};

function DesktopPlayerCard({ currentTime, duration, hostRef, isPlaying, isReady, nowPlaying, onNext, onPrevious, onSeek, onToggle }: PlayerCardProps) {
  return (
    <div className={`${PLAYER_GLASS} hidden h-[116px] items-center gap-5 rounded-[22px] p-3 pr-5 sm:flex`}>
      <ArtworkSlot hostRef={hostRef} hasPlaylist />
      <div className="min-w-0 flex-1">
        <TrackDetails nowPlaying={nowPlaying} />
        <div className="mt-2">
          <SeekBar currentTime={currentTime} duration={duration} onSeek={onSeek} disabled={!isReady} />
        </div>
        <div className="-mt-1 flex justify-between text-[10.5px] font-medium tabular-nums text-white/[0.62]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <Transport isPlaying={isPlaying} disabled={!isReady} onPrevious={onPrevious} onToggle={onToggle} onNext={onNext} />
    </div>
  );
}

function MobilePlayerCard({ currentTime, duration, hostRef, isPlaying, isReady, nowPlaying, onNext, onPrevious, onSeek, onToggle }: PlayerCardProps) {
  return (
    <div className={`${PLAYER_GLASS} rounded-[22px] p-3 sm:hidden`}>
      <div className="grid gap-3">
        <ArtworkSlot hostRef={hostRef} hasPlaylist compact />
        <TrackDetails nowPlaying={nowPlaying} compact />
      </div>
      <div className="mt-2">
        <SeekBar currentTime={currentTime} duration={duration} onSeek={onSeek} disabled={!isReady} />
      </div>
      <div className="relative -mt-0.5 flex min-h-13 items-center justify-center">
        <div className="absolute left-0 flex gap-1 text-[10.5px] font-medium tabular-nums text-white/60">
          <span>{formatTime(currentTime)}</span>
          <span className="text-white/30">/</span>
          <span>{formatTime(duration)}</span>
        </div>
        <Transport isPlaying={isPlaying} disabled={!isReady} onPrevious={onPrevious} onToggle={onToggle} onNext={onNext} />
      </div>
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
  const isDesktop = useIsDesktop();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerHostRef = useRef<HTMLDivElement | null>(null);
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

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT || !playerHostRef.current) return;

      instance = new window.YT.Player(playerHostRef.current, {
        videoId: APPROVED_YOUTUBE_PLAYLIST.startVideoId,
        width: "100%",
        height: "100%",
        playerVars: {
          index: 0,
          list: APPROVED_YOUTUBE_PLAYLIST.id,
          listType: "playlist",
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: ({ target }) => {
            playerRef.current = target;
            target.cuePlaylist({ list: APPROVED_YOUTUBE_PLAYLIST.id, listType: "playlist", index: 0 });
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
            shouldResumeRef.current = true;
            target.nextVideo();
            playAfterQueueMove();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (playerRef.current === instance) playerRef.current = null;
      instance?.destroy();
    };
  }, [isDesktop, playAfterQueueMove, syncFromPlayer]);

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
      player.playVideo();
    }
  };

  const seek = useCallback((time: number) => {
    playerRef.current?.seekTo(time, true);
    setCurrentTime(time);
  }, []);

  const playlist = PLAYLISTS[playlistIndex];

  return (
    <div className="pointer-events-auto w-full">
      <div className="mb-3 text-center drop-shadow-sm">
        <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-pujo-light/95">{playlist.eyebrow}</p>
      </div>

      <PlaylistChips activeIndex={playlistIndex} onChange={switchPlaylist} />
      {isDesktop ? (
        <DesktopPlayerCard
          currentTime={currentTime}
          duration={duration}
          hostRef={playerHostRef}
          isPlaying={isPlaying}
          isReady={isReady}
          nowPlaying={nowPlaying}
          onPrevious={previous}
          onToggle={togglePlayback}
          onNext={next}
          onSeek={seek}
        />
      ) : (
        <MobilePlayerCard
          currentTime={currentTime}
          duration={duration}
          hostRef={playerHostRef}
          isPlaying={isPlaying}
          isReady={isReady}
          nowPlaying={nowPlaying}
          onPrevious={previous}
          onToggle={togglePlayback}
          onNext={next}
          onSeek={seek}
        />
      )}
    </div>
  );
}
