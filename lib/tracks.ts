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
  { id: "pujo-radio", label: "Pujo Radio", eyebrow: "Festival radio", tracks: [] },
  { id: "dhak", label: "Dhak", eyebrow: "Pandal rhythm", tracks: [] },
];
