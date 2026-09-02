"use client";

import { useEffect, type RefObject } from "react";
import * as THREE from "three";

import type { CinematicLookRefs } from "@/components/cinematic/cinematicLookTypes";

type DesktopLookControllerProps = {
  stageRef: RefObject<HTMLElement | null>;
  active: boolean;
  reducedMotion: boolean;
  refs: CinematicLookRefs;
};

export function useDesktopLookController({
  stageRef,
  active,
  reducedMotion,
  refs,
}: DesktopLookControllerProps) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !active || reducedMotion) return;

    const reset = () => {
      refs.lookRef.current.x = 0;
      refs.lookRef.current.y = 0;
      refs.isLookingRef.current = false;
      refs.inputTypeRef.current = "none";
      refs.debugRef.current.inputType = "none";
      refs.debugRef.current.targetLookX = 0;
      refs.debugRef.current.targetLookY = 0;
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = stage.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2;
      const lookX = THREE.MathUtils.clamp(x, -1, 1);
      const lookY = -THREE.MathUtils.clamp(y, -1, 1);
      refs.lookRef.current.x = lookX;
      refs.lookRef.current.y = lookY;
      refs.isLookingRef.current = true;
      refs.inputTypeRef.current = "pointer";
      refs.debugRef.current.inputType = "pointer";
      refs.debugRef.current.targetLookX = lookX;
      refs.debugRef.current.targetLookY = lookY;
      refs.debugRef.current.rawLookX = lookX;
      refs.debugRef.current.currentX = event.clientX;
      refs.debugRef.current.currentY = event.clientY;
    };

    stage.addEventListener("pointermove", handlePointerMove);
    stage.addEventListener("pointerleave", reset);

    return () => {
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerleave", reset);
      reset();
    };
  }, [active, reducedMotion, refs, stageRef]);
}
