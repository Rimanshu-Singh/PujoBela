"use client";

import { useEffect, useState } from "react";

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
type BackgroundSource = {
  wide: string;
  tall: string;
};

const BACKGROUND_CONFIG = {
  morningImage: {
    wide: "/bg/morning-wide.png",
    tall: "/bg/morning-tall.png",
  },
  afternoonImage: {
    wide: "/bg/Afternoon-wide.png",
    tall: "/bg/Afternoon-tall.png",
  },
  eveningImage: {
    wide: "/bg/Evening-wide.png",
    tall: "/bg/Evening-tall.png",
  },
  nightImage: {
    wide: "/bg/Night-wide.png",
    tall: "/bg/Night-tall.png",
  },
} as const;

const BACKGROUND_IMAGES: Record<TimeOfDay, BackgroundSource> = {
  morning: BACKGROUND_CONFIG.morningImage,
  afternoon: BACKGROUND_CONFIG.afternoonImage,
  evening: BACKGROUND_CONFIG.eveningImage,
  night: BACKGROUND_CONFIG.nightImage,
};

export function getCurrentTimeOfDay(now = new Date()): TimeOfDay {
  // IST is always UTC+5:30 with no Daylight Saving Time
  const istMillis = now.getTime() + 5.5 * 60 * 60 * 1000;
  const hour = new Date(istMillis).getUTCHours();

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

export function DynamicBackground() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getCurrentTimeOfDay());
  const backgroundImage = BACKGROUND_IMAGES[timeOfDay];

  useEffect(() => {
    Object.values(BACKGROUND_CONFIG)
      .flatMap(({ wide, tall }) => [wide, tall])
      .forEach((src) => {
        const image = new Image();
        image.src = src;
      });

    const updateBackground = () => setTimeOfDay(getCurrentTimeOfDay());
    updateBackground();

    const interval = window.setInterval(updateBackground, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className="hero-bg"
      aria-hidden="true"
      data-background-image={`${backgroundImage.tall}|${backgroundImage.wide}`}
    >
      {(Object.entries(BACKGROUND_IMAGES) as [TimeOfDay, BackgroundSource][]).map(([period, src]) => {
        const isActive = period === timeOfDay;
        return (
          <picture
            key={period}
            className={`hero-bg-image-layer ${isActive ? "opacity-100" : "opacity-0"}`}
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 0 : -1,
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            <source media="(min-width: 768px)" srcSet={src.wide} />
            <img
              className="hero-bg-image"
              src={src.tall}
              alt=""
              loading="eager"
              fetchPriority={isActive ? "high" : "low"}
            />
          </picture>
        );
      })}
      <img
        className="hero-bg-title"
        src="/bg/pujo-asche-title.png"
        alt=""
        loading="eager"
        fetchPriority="high"
        draggable={false}
      />
    </div>
  );
}
