"use client";

import { useEffect, type RefObject } from "react";
import * as THREE from "three";

import type { CinematicLookRefs } from "@/components/cinematic/cinematicLookTypes";
import { DOOR_CHOREOGRAPHY } from "@/components/experiments/door/doorConfig";

type MobileLookControllerProps = {
  stageRef: RefObject<HTMLElement | null>;
  active: boolean;
  reducedMotion: boolean;
  refs: CinematicLookRefs;
};

export function useMobileLookController({
  stageRef,
  active,
  reducedMotion,
  refs,
}: MobileLookControllerProps) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !active || reducedMotion) return;

    let pointerId: number | null = null;
    let intent: "look" | "scroll" | "none" = "none";
    let startX = 0;
    let startY = 0;
    let startLookX = 0;
    let captured = false;
    let fullLookDistance = 90;
    let activationSuppressionTimer: number | null = null;

    const clearActivationSuppressionTimer = () => {
      if (activationSuppressionTimer !== null) {
        window.clearTimeout(activationSuppressionTimer);
        activationSuppressionTimer = null;
      }
    };

    const suppressInvitationActivationForThisPointer = () => {
      clearActivationSuppressionTimer();
      refs.invitationActivationSuppressedRef.current = true;
    };

    const reset = () => {
      clearActivationSuppressionTimer();
      refs.invitationActivationSuppressedRef.current = false;
      if (captured && pointerId !== null && stage.hasPointerCapture(pointerId)) {
        stage.releasePointerCapture(pointerId);
      }
      pointerId = null;
      intent = "none";
      captured = false;
      refs.lookRef.current.x = 0;
      refs.lookRef.current.y = 0;
      refs.isLookingRef.current = false;
      refs.inputTypeRef.current = "none";
      refs.debugRef.current.inputType = "none";
      refs.debugRef.current.gestureIntent = "none";
      refs.debugRef.current.pointerDown = false;
      refs.debugRef.current.pointerCaptured = false;
      refs.debugRef.current.targetLookX = 0;
      refs.debugRef.current.targetLookY = 0;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      clearActivationSuppressionTimer();
      refs.invitationActivationSuppressedRef.current = false;
      pointerId = event.pointerId;
      intent = "none";
      startX = event.clientX;
      startY = event.clientY;
      startLookX = refs.lookRef.current.x;
      fullLookDistance = THREE.MathUtils.clamp(
        window.innerWidth * DOOR_CHOREOGRAPHY.pointerCamera.mobileFullLookDistanceFraction,
        DOOR_CHOREOGRAPHY.pointerCamera.mobileMinFullLookDistancePx,
        DOOR_CHOREOGRAPHY.pointerCamera.mobileMaxFullLookDistancePx,
      );
      refs.debugRef.current.inputType = "touch";
      refs.inputTypeRef.current = "touch";
      refs.debugRef.current.gestureIntent = "none";
      refs.debugRef.current.pointerDown = true;
      refs.debugRef.current.pointerCaptured = false;
      refs.debugRef.current.startX = startX;
      refs.debugRef.current.startY = startY;
      refs.debugRef.current.currentX = startX;
      refs.debugRef.current.currentY = startY;
      refs.debugRef.current.rawDx = 0;
      refs.debugRef.current.rawDy = 0;
      refs.debugRef.current.rawLookX = startLookX;
      refs.debugRef.current.fullLookDistancePx = fullLookDistance;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || pointerId !== event.pointerId) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      refs.debugRef.current.currentX = event.clientX;
      refs.debugRef.current.currentY = event.clientY;
      refs.debugRef.current.rawDx = dx;
      refs.debugRef.current.rawDy = dy;

      if (intent === "none" && Math.max(absDx, absDy) >= DOOR_CHOREOGRAPHY.pointerCamera.mobileGestureThreshold) {
        if (absDx > absDy * DOOR_CHOREOGRAPHY.pointerCamera.mobileClassificationRatio) intent = "look";
        else if (absDy > absDx * DOOR_CHOREOGRAPHY.pointerCamera.mobileClassificationRatio) intent = "scroll";
        refs.debugRef.current.gestureIntent = intent;
        if (intent === "look") {
          suppressInvitationActivationForThisPointer();
          refs.isLookingRef.current = true;
          stage.setPointerCapture(event.pointerId);
          captured = true;
          refs.debugRef.current.pointerCaptured = true;
        }
      }

      if (intent !== "look") return;

      event.preventDefault();
      const rawLookX = THREE.MathUtils.clamp(startLookX - dx / fullLookDistance, -1, 1);
      const resistantLookX = Math.sign(rawLookX) * (Math.abs(rawLookX) > 0.9
        ? 0.9 + (Math.abs(rawLookX) - 0.9) * 0.5
        : Math.abs(rawLookX));
      refs.lookRef.current.x = resistantLookX;
      refs.debugRef.current.rawLookX = rawLookX;
      refs.debugRef.current.targetLookX = resistantLookX;
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || pointerId !== event.pointerId) return;
      const wasLookGesture = intent === "look";
      reset();
      if (wasLookGesture) {
        activationSuppressionTimer = window.setTimeout(() => {
          refs.invitationActivationSuppressedRef.current = false;
          activationSuppressionTimer = null;
        }, 250);
      }
    };

    stage.addEventListener("pointerdown", handlePointerDown);
    stage.addEventListener("pointermove", handlePointerMove, { passive: false });
    stage.addEventListener("pointerup", handlePointerEnd);
    stage.addEventListener("pointercancel", handlePointerEnd);

    return () => {
      stage.removeEventListener("pointerdown", handlePointerDown);
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerup", handlePointerEnd);
      stage.removeEventListener("pointercancel", handlePointerEnd);
      reset();
    };
  }, [active, reducedMotion, refs, stageRef]);
}
