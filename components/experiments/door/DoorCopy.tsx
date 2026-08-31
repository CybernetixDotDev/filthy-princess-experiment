"use client";

import { DOOR_CHOREOGRAPHY } from "@/components/experiments/door/doorConfig";

type DoorCopyProps = {
  progress: number;
};

export function DoorCopy({ progress }: DoorCopyProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {DOOR_CHOREOGRAPHY.text.map((beat) => (
        <p
          key={beat.copy}
          className="absolute left-1/2 w-[min(86vw,760px)] -translate-x-1/2 text-center font-mono text-[clamp(0.78rem,2.3vw,1.45rem)] uppercase tracking-[0.34em] text-white"
          style={{
            top: beat.y,
            opacity: getBeatOpacity(progress, beat.start, beat.end),
            transform: `translate(-50%, ${getBeatDrift(progress, beat.start, beat.end)}px)`,
            textShadow: "0 0 30px rgba(214, 107, 147, 0.22)",
          }}
        >
          {beat.copy}
        </p>
      ))}
    </div>
  );
}

function getBeatOpacity(progress: number, start: number, end: number) {
  if (progress < start || progress > end) {
    return 0;
  }

  const localProgress = (progress - start) / (end - start);
  const fadeIn = smoothstep(0, 0.28, localProgress);
  const fadeOut = 1 - smoothstep(0.72, 1, localProgress);

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
