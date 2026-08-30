# PujoBela

**Songs for the season.**

PujoBela is an immersive Durga Puja radio experience built for long afternoons, pandal-hopping evenings, and the feeling of homecoming. It pairs a YouTube-powered festive playlist with responsive artwork, ambient motion, and a warm frosted-glass interface.

## Highlights

- YouTube playlist playback with play/pause, previous/next, seeking, shuffle, and repeat.
- Live track title, channel name, artwork, elapsed time, and duration.
- Responsive static artwork optimized for desktop and mobile compositions.
- Kolkata time, Supabase Realtime active-listener presence, and Durga Puja countdown.
- YouTube Music playlist shortcuts.
- Responsive creator, support, and feedback dialogs, with feedback saved to Google Forms.
- Keyboard-accessible controls, visible focus states, Escape-to-close dialogs, and reduced-motion support.
- Vercel Analytics and Speed Insights integration.

## Tech stack

- [Next.js](https://nextjs.org/) 16 with the App Router
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Lucide React](https://lucide.dev/)
- [Supabase Realtime Presence](https://supabase.com/docs/guides/realtime/presence) for anonymous listener presence
- YouTube IFrame Player API
- Vercel Analytics and Speed Insights

## Getting started

### Prerequisites

- Node.js 20.9 or newer
- npm

### Installation

```bash
git clone https://github.com/Rimanshu-Singh/PujoBela.git
cd PujoBela
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run TypeScript validation with `tsc --noEmit`. |

## Environment variables

The feedback dialog submits directly to the configured public Google Form and records a submission event through Vercel Analytics. Active-listener presence uses Supabase Realtime Presence with public anon credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create a free Supabase project, enable Realtime, and add these variables in your local `.env.local` and Vercel project settings. Without Supabase credentials, the listener display safely falls back to `1`.

## Project structure

```text
app/
  globals.css          Global theme, responsive layout, and glass effects
  layout.tsx           Metadata, viewport settings, and Vercel integrations
  page.tsx             Background layers and primary page composition
components/
  feedback-button.tsx  Feedback trigger, dialog, validation, and submission
  icons.tsx            Small reusable SVG icon components
  player.tsx           YouTube player, transport controls, seek bar, and UI
  top-bar.tsx          Clock, listener status, playlist links, and dialogs
hooks/
  use-active-listeners.ts Supabase Realtime per-tab listener presence
lib/
  tracks.ts            YouTube playlist and local playlist configuration
public/
  bg/                   Responsive desktop and mobile background artwork
  creator/              Creator profile assets
types/
  youtube.d.ts          YouTube IFrame API type declarations
```

## Background media

PujoBela uses different media by viewport size:

| Viewport | Asset | Behavior |
| --- | --- | --- |
| Mobile | `public/bg/scene-tall.png` | Static 9:16 artwork for faster loading and lower battery usage. |
| Desktop | `public/bg/scene-wide.png` | Full-screen wide artwork with centered, cover-style cropping. |

Both images are delivered through a responsive `<picture>` element. The artwork remains underneath the dark overlay, texture layers, and all interactive UI.

## Playlist configuration

The embedded player configuration lives in [`lib/tracks.ts`](lib/tracks.ts):

```ts
export const APPROVED_YOUTUBE_PLAYLIST = {
  id: "PLR949LBNtYuU",
  startVideoId: "SFJeglBF5cg",
  startIndex: 0,
  source: "https://www.youtube.com/playlist?list=PLR949LBNtYuU",
};
```

When changing the playlist:

1. Replace `id` with the YouTube playlist ID.
2. Set `startIndex` to the desired zero-based track index.
3. Set `startVideoId` to a playable video from that playlist for the initial thumbnail and player bootstrap.
4. Update the external `PLAYLIST_URL` in [`components/top-bar.tsx`](components/top-bar.tsx) if the shortcut should point somewhere else.

The YouTube IFrame API is loaded only in the browser. Audio playback begins after user interaction to comply with browser autoplay policies.

## Customization

| Item | Location |
| --- | --- |
| Theme, glass styling, animations | `app/globals.css` |
| Page title and description | `app/layout.tsx` |
| Puja date and listener display | `components/top-bar.tsx` |
| Active-listener presence | `hooks/use-active-listeners.ts` |
| Creator name, Instagram, email, and image | `components/top-bar.tsx` |
| Support/payment destination | `SUPPORT_URL` in `components/top-bar.tsx` |
| Playlist ID and starting track | `lib/tracks.ts` |
| Google Form action and entry IDs | `components/feedback-button.tsx` |

## Accessibility and responsive behavior

- All icon-only actions include accessible labels.
- Dialogs support Escape, outside-click dismissal, focus restoration, and page-scroll locking.
- The creator and support dialogs render through portals so filtered glass ancestors do not constrain their backdrops.
- Focus-visible outlines are provided for keyboard users.
- Motion-heavy effects are disabled when `prefers-reduced-motion: reduce` is enabled.
- The top bar condenses on small screens: the clock is hidden and the countdown detail collapses while the listener status remains visible.

## Production build

```bash
npm run lint
npm run build
npm run start
```

The project is ready for deployment on Vercel or any platform that supports Next.js. For Vercel, import the repository and deploy with the default framework settings.

## Before publishing

- Replace `public/creator/rimanshu-singh-placeholder.svg` with the final creator photo.
- Replace the placeholder `SUPPORT_URL` with the real payment or support destination.
- Confirm the configured Google Form remains public and accepts responses.
- Confirm `startVideoId` belongs to the configured YouTube playlist.
- Confirm you have permission to distribute the background artwork and linked music.

## Creator

Made with bhalobasha by **Rimanshu Singh**.

- Instagram: [@rimmu.1x](https://www.instagram.com/rimmu.1x/)
- Email: [rimanshupatel1@gmail.com](mailto:rimanshupatel1@gmail.com)

---

If PujoBela brings back even a little of the dhaak, light, and anticipation of Puja, it has done its job.
