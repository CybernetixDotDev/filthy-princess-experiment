"use client";

import { getDoorTextureBlend } from "@/components/experiments/door/doorProgress";

type DoorDebugReadoutProps = {
  progress: number;
  pinned: boolean;
};

export function DoorDebugReadout({ progress, pinned }: DoorDebugReadoutProps) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const blend = getDoorTextureBlend(progress);

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-20 font-mono text-[10px] uppercase leading-5 tracking-[0.16em] text-white/55">
      <div>progress {progress.toFixed(3)}</div>
      <div>current {blend.currentFrame.id}</div>
      <div>next {blend.nextFrame.id}</div>
      <div>blend {blend.mix.toFixed(3)}</div>
      <div>pinned {pinned ? "true" : "false"}</div>
    </div>
  );
}
