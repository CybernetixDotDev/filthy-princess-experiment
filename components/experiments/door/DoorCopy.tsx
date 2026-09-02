"use client";

import { useEffect, useState } from "react";

import { DOOR_CHOREOGRAPHY } from "@/components/experiments/door/doorConfig";

type DoorCopyProps = {
  progress: number;
};

export function DoorCopy({ progress }: DoorCopyProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 pt-[max(16px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))]">
      {DOOR_CHOREOGRAPHY.text.map((beat) => (
        <p
          key={beat.copy}
          className="absolute left-1/2 w-[min(86vw,760px)] whitespace-pre-line px-0 text-center font-mono text-[clamp(0.78rem,2.3vw,1.45rem)] uppercase leading-relaxed tracking-[0.34em] text-white [overflow-wrap:anywhere] [text-wrap:balance]"
          style={{
            top: isMobile ? beat.mobileY : beat.y,
            width: isMobile
              ? "calc(100vw - 40px - env(safe-area-inset-left) - env(safe-area-inset-right))"
              : undefined,
            maxWidth: isMobile ? "88vw" : undefined,
            whiteSpace: isMobile ? "pre-line" : "normal",
            fontSize: isMobile
              ? getMobileFontSize(beat.copy)
              : beat.copy === "COME INSIDE"
                ? "clamp(2.34rem, 6.9vw, 4.35rem)"
                : undefined,
            letterSpacing: isMobile ? "0.08em" : undefined,
            opacity: getBeatOpacity(
              progress,
              beat.start,
              beat.end,
              beat.copy === "you found me." ? DOOR_CHOREOGRAPHY.youFoundMeTiming : undefined,
            ),
            transform: `translate(-50%, ${getBeatDrift(progress, beat.start, beat.end)}px)`,
            textShadow: "0 0 30px rgba(214, 107, 147, 0.22)",
          }}
        >
          {isMobile && beat.mobileCopy ? beat.mobileCopy : beat.copy}
        </p>
      ))}
    </div>
  );
}

function getMobileFontSize(copy: string) {
  return copy === "FILTHY PRINCESS" || copy === "COME INSIDE"
    ? "clamp(2rem, 9vw, 3.5rem)"
    : "clamp(1.25rem, 5.5vw, 2rem)";
}

function getBeatOpacity(
  progress: number,
  start: number,
  end: number,
  lifecycle?: typeof DOOR_CHOREOGRAPHY.youFoundMeTiming,
) {
  const enterStart = lifecycle?.enterStart ?? start;
  const enterComplete = lifecycle?.enterComplete ?? start + (end - start) * 0.28;
  const exitStart = lifecycle?.exitStart ?? start + (end - start) * 0.72;
  const exitComplete = lifecycle?.exitComplete ?? end;

  if (progress < enterStart || progress > exitComplete) {
    return 0;
  }

  const fadeIn = smoothstep(enterStart, enterComplete, progress);
  const fadeOut = 1 - smoothstep(exitStart, exitComplete, progress);

  return Math.min(fadeIn, fadeOut);
}

function getBeatDrift(progress: number, start: number, end: number) {
  if (progress < start || progress > end) {
    return 14;
  }

  const localProgress = (progress - start) / (end - start);
  return 14 - smoothstep(0, 1, localProgress) * 28;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);

  return x * x * (3 - 2 * x);
}
