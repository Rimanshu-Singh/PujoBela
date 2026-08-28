import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.8 };

export function PlayIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M8.2 5.4a1 1 0 0 1 1.52-.85l10 6.6a1 1 0 0 1 0 1.7l-10 6.6a1 1 0 0 1-1.52-.85V5.4Z" /></svg>;
}

export function PauseIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M6.75 5.25A1.25 1.25 0 0 1 8 4h1.5a1.25 1.25 0 0 1 1.25 1.25v13.5A1.25 1.25 0 0 1 9.5 20H8a1.25 1.25 0 0 1-1.25-1.25V5.25Zm6.5 0A1.25 1.25 0 0 1 14.5 4H16a1.25 1.25 0 0 1 1.25 1.25v13.5A1.25 1.25 0 0 1 16 20h-1.5a1.25 1.25 0 0 1-1.25-1.25V5.25Z" /></svg>;
}

export function PreviousIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M6 5.5a1 1 0 0 1 2 0v5.15l8.9-5.5a1 1 0 0 1 1.53.85v12a1 1 0 0 1-1.53.85L8 13.35v5.15a1 1 0 1 1-2 0v-13Z" /></svg>;
}

export function NextIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M18 5.5a1 1 0 1 0-2 0v5.15l-8.9-5.5A1 1 0 0 0 5.57 6v12a1 1 0 0 0 1.53.85l8.9-5.5v5.15a1 1 0 1 0 2 0v-13Z" /></svg>;
}

export function InstagramIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.4 6.7h.01" strokeWidth="2.4" /></svg>;
}

export function ShareIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}><circle cx="18" cy="5" r="2.25" /><circle cx="6" cy="12" r="2.25" /><circle cx="18" cy="19" r="2.25" /><path d="m8 10.9 8-4.7M8 13.1l8 4.7" /></svg>;
}

export function VolumeIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}><path d="M5 9v6h4l5 4V5L9 9H5Z" /><path d="M17 9a4.2 4.2 0 0 1 0 6M19.5 6.5a7.8 7.8 0 0 1 0 11" /></svg>;
}
