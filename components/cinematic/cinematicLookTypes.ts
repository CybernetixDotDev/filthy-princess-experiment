import type { MutableRefObject } from "react";

export type CinematicInputType = "pointer" | "touch" | "none";
export type CinematicGestureIntent = "look" | "scroll" | "none";

export type CinematicLookDebug = {
  inputType: CinematicInputType;
  gestureIntent: CinematicGestureIntent;
  pointerDown: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  rawDx: number;
  rawDy: number;
  rawLookX: number;
  fullLookDistancePx: number;
  activeTouchDamping: number;
  releaseDamping: number;
  pointerCaptured: boolean;
  targetLookX: number;
  targetLookY: number;
  dampedLookX: number;
  dampedLookY: number;
  maxLookRange: number;
};

export type CinematicLookRefs = {
  lookRef: MutableRefObject<{ x: number; y: number }>;
  isLookingRef: MutableRefObject<boolean>;
  inputTypeRef: MutableRefObject<CinematicInputType>;
  invitationActivationSuppressedRef: MutableRefObject<boolean>;
  debugRef: MutableRefObject<CinematicLookDebug>;
};

export function createCinematicLookDebug(): CinematicLookDebug {
  return {
    inputType: "none",
    gestureIntent: "none",
    pointerDown: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    rawDx: 0,
    rawDy: 0,
    rawLookX: 0,
    fullLookDistancePx: 0,
    activeTouchDamping: 0,
    releaseDamping: 0,
    pointerCaptured: false,
    targetLookX: 0,
    targetLookY: 0,
    dampedLookX: 0,
    dampedLookY: 0,
    maxLookRange: 0,
  };
}
