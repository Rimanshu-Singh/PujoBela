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

const KOLKATA_HOUR_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Kolkata",
});

export function getCurrentTimeOfDay(now = new Date()): TimeOfDay {
  const hour = Number(KOLKATA_HOUR_FORMATTER.format(now));

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
      {(Object.entries(BACKGROUND_IMAGES) as [TimeOfDay, BackgroundSource][]).map(([period, src]) => (
        <picture
          key={period}
          className={`hero-bg-image-layer ${period === timeOfDay ? "opacity-100" : "opacity-0"}`}
        >
          <source media="(min-width: 768px)" srcSet={src.wide} />
          <img
            className="hero-bg-image"
            src={src.tall}
            alt=""
            loading="eager"
            fetchPriority={period === timeOfDay ? "high" : "low"}
          />
        </picture>
      ))}
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
