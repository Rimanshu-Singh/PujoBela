export type Track = {
  id: string;
  title: string;
  artist: string;
  film: string;
  year: number;
  duration: number;
  videoId: string;
};

export type Playlist = {
  id: string;
  label: string;
  eyebrow: string;
  tracks: Track[];
};

// Add a rights-cleared song with one line inside the appropriate `tracks` array:
// { id: "unique-id", title: "Song", artist: "Artist", film: "Film", year: 1972, duration: 184, videoId: "RIGHTS_HOLDER_VIDEO_ID" },
export const PLAYLISTS: Playlist[] = [
  { id: "agomoni", label: "Agomoni", eyebrow: "First light", tracks: [] },
  { id: "adda", label: "Pandal Adda", eyebrow: "Golden hour", tracks: [] },
  { id: "bishorjon", label: "Bishorjon", eyebrow: "One last song", tracks: [] },
];
