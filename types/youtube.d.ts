export {};

declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }

  interface YouTubePlayer {
    playVideo(): void;
    pauseVideo(): void;
    nextVideo(): void;
    previousVideo(): void;
    setLoop(loopPlaylists: boolean): void;
    setShuffle(shufflePlaylist: boolean): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    cuePlaylist(options: { list: string; listType: "playlist"; index?: number; startSeconds?: number }): void;
    loadPlaylist(options: { list: string; listType: "playlist"; index?: number; startSeconds?: number }): void;
    loadVideoById(videoId: string): void;
    cueVideoById(videoId: string): void;
    getCurrentTime(): number;
    getDuration(): number;
    getVideoData(): { video_id?: string; title?: string; author?: string };
    destroy(): void;
  }

  interface YouTubePlayerOptions {
    videoId?: string;
    width?: string | number;
    height?: string | number;
    playerVars?: Record<string, string | number>;
    events?: {
      onReady?: (event: { target: YouTubePlayer }) => void;
      onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
      onError?: (event: { data: number; target: YouTubePlayer }) => void;
    };
  }
}
