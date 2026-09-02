"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

import { useDesktopLookController } from "@/components/cinematic/DesktopLookController";
import { createCinematicLookDebug, type CinematicLookRefs } from "@/components/cinematic/cinematicLookTypes";
import { useMobileLookController } from "@/components/cinematic/MobileLookController";

export type {
  CinematicGestureIntent,
  CinematicInputType,
  CinematicLookDebug,
} from "@/components/cinematic/cinematicLookTypes";

type CinematicLookOptions = {
  stageRef: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
};

export function useCinematicLook({ stageRef, reducedMotion }: CinematicLookOptions): CinematicLookRefs {
  const [mode, setMode] = useState<"unknown" | "desktop" | "mobile">("unknown");
  const lookRef = useRef({ x: 0, y: 0 });
  const isLookingRef = useRef(false);
  const inputTypeRef = useRef<"pointer" | "touch" | "none">("none");
  const invitationActivationSuppressedRef = useRef(false);
  const debugRef = useRef(createCinematicLookDebug());
  const refs = useMemo(() => ({
    lookRef,
    isLookingRef,
    inputTypeRef,
    invitationActivationSuppressedRef,
    debugRef,
  }), [debugRef, inputTypeRef, invitationActivationSuppressedRef, isLookingRef, lookRef]);

  useDesktopLookController({ stageRef, active: mode === "desktop", reducedMotion, refs });
  useMobileLookController({ stageRef, active: mode === "mobile", reducedMotion, refs });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)");
    const updateMode = () => setMode(mediaQuery.matches ? "desktop" : "mobile");
    const frame = window.requestAnimationFrame(updateMode);
    mediaQuery.addEventListener("change", updateMode);

    return () => {
      window.cancelAnimationFrame(frame);
      mediaQuery.removeEventListener("change", updateMode);
    };
  }, []);

  return refs;
}
