"use client";

import { useEffect, useState, type MutableRefObject } from "react";

import type { CinematicLookDebug } from "@/components/cinematic/useCinematicLook";
import type { CameraDebugState } from "@/components/experiments/door/DoorScene";
import type { SecretDebugState } from "@/components/experiments/door/SecretInvitation";
import { DOOR_CHOREOGRAPHY } from "@/components/experiments/door/doorConfig";
import { getDoorTextureBlend } from "@/components/experiments/door/doorProgress";

type DoorDebugReadoutProps = {
  progress: number;
  pinned: boolean;
  cameraDebugRef: MutableRefObject<CameraDebugState>;
  lookDebugRef: MutableRefObject<CinematicLookDebug>;
  secretDebugRef: MutableRefObject<SecretDebugState>;
};

export function DoorDebugReadout({ progress, pinned, cameraDebugRef, lookDebugRef, secretDebugRef }: DoorDebugReadoutProps) {
  const [enabled] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1",
  );
  const [viewport, setViewport] = useState(() =>
    typeof window === "undefined"
      ? { width: 0, height: 0 }
      : { width: window.innerWidth, height: window.innerHeight },
  );
  const [camera, setCamera] = useState<CameraDebugState>({
    fov: DOOR_CHOREOGRAPHY.camera.fov,
    aspect: 1,
    position: [0, 0, 14],
    yaw: 0,
    sceneDistance: 14,
    visibleHeight: 0,
    visibleWidth: 0,
    maxLookX: 0,
    lookFraction: DOOR_CHOREOGRAPHY.pointerCamera.desktopViewportFraction,
  });
  const [look, setLook] = useState<CinematicLookDebug>({
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
    maxLookRange: 0,
    fullLookDistancePx: 0,
    activeTouchDamping: 0,
    releaseDamping: 0,
    pointerCaptured: false,
    targetLookX: 0,
    targetLookY: 0,
    dampedLookX: 0,
    dampedLookY: 0,
  });
  const [secret, setSecret] = useState<SecretDebugState>({
    windowActive: false,
    lifecycleActive: false,
    visible: false,
    interactive: false,
    progress: 0,
    opacity: 0,
    position: [0, 0, 0],
    width: DOOR_CHOREOGRAPHY.secretInvite.width,
    centeredRightEdge: 0,
    insideCurrentFrustum: false,
    fullyInsideCurrentFrustum: false,
    glowIntensity: 0,
  });

  useEffect(() => {
    const updateViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    const updateCamera = () => {
      setCamera({ ...cameraDebugRef.current, position: [...cameraDebugRef.current.position] });
      setLook({ ...lookDebugRef.current });
      setSecret({ ...secretDebugRef.current, position: [...secretDebugRef.current.position] });
    };
    window.addEventListener("resize", updateViewport);
    const interval = window.setInterval(updateCamera, 100);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.clearInterval(interval);
    };
  }, [cameraDebugRef, lookDebugRef, secretDebugRef]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (!enabled) {
    return null;
  }

  const blend = getDoorTextureBlend(progress);
  const isMobile = viewport.width > 0 && viewport.width < 768;

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-20 max-w-[calc(100vw-2rem)] font-mono text-[10px] uppercase leading-5 tracking-[0.12em] text-white/55">
      <div>progress {progress.toFixed(3)}</div>
      <div>current {blend.currentFrame.id}</div>
      <div>next {blend.nextFrame.id}</div>
      <div>blend {blend.mix.toFixed(3)}</div>
      <div>pinned {pinned ? "true" : "false"}</div>
      <div>viewport {viewport.width}x{viewport.height}</div>
      <div>isMobile {isMobile ? "true" : "false"}</div>
      <div>layout {isMobile ? "mobile" : "desktop"}</div>
      <div>camera fov {camera.fov.toFixed(1)}</div>
      <div>camera aspect {camera.aspect.toFixed(3)}</div>
      <div>camera pos {camera.position.map((value) => value.toFixed(2)).join(", ")}</div>
      <div>camera yaw {(camera.yaw * (180 / Math.PI)).toFixed(2)}deg</div>
      <div>scene distance {camera.sceneDistance.toFixed(2)}</div>
      <div>visible h/w {camera.visibleHeight.toFixed(2)} / {camera.visibleWidth.toFixed(2)}</div>
      <div>look fraction {camera.lookFraction.toFixed(2)}</div>
      <div>max lookX {camera.maxLookX.toFixed(2)}</div>
      <div>input {look.inputType}</div>
      <div>gesture {look.gestureIntent}</div>
      <div>pointer down {look.pointerDown ? "true" : "false"}</div>
      <div>start {look.startX.toFixed(0)}, {look.startY.toFixed(0)}</div>
      <div>current {look.currentX.toFixed(0)}, {look.currentY.toFixed(0)}</div>
      <div>delta {look.rawDx.toFixed(1)}, {look.rawDy.toFixed(1)}</div>
      <div>full look px {look.fullLookDistancePx.toFixed(1)}</div>
      <div>raw lookX {look.rawLookX.toFixed(3)}</div>
      <div>target lookX {look.targetLookX.toFixed(3)}</div>
      <div>damped lookX {look.dampedLookX.toFixed(3)}</div>
      <div>max look range +/-{look.maxLookRange.toFixed(2)}</div>
      <div>touch damping {look.activeTouchDamping.toFixed(2)}</div>
      <div>release damping {look.releaseDamping.toFixed(2)}</div>
      <div>pointer captured {look.pointerCaptured ? "true" : "false"}</div>
      <div>secret active {secret.windowActive ? "true" : "false"}</div>
      <div>secret lifecycle {secret.lifecycleActive ? "true" : "false"}</div>
      <div>secret visible {secret.visible ? "true" : "false"}</div>
      <div>secret interactive {secret.interactive ? "true" : "false"}</div>
      <div>secret opacity {secret.opacity.toFixed(3)}</div>
      <div>secret xyz {secret.position.map((value) => value.toFixed(2)).join(", ")}</div>
      <div>secret width {secret.width.toFixed(2)}</div>
      <div>center right edge {secret.centeredRightEdge.toFixed(2)}</div>
      <div>secret in frustum {secret.insideCurrentFrustum ? "true" : "false"}</div>
      <div>secret fully in frustum {secret.fullyInsideCurrentFrustum ? "true" : "false"}</div>
      <div>glow intensity {secret.glowIntensity.toFixed(3)}</div>
      <div>you found me {DOOR_CHOREOGRAPHY.youFoundMeTiming.enterStart.toFixed(3)} / {DOOR_CHOREOGRAPHY.youFoundMeTiming.enterComplete.toFixed(3)} / {DOOR_CHOREOGRAPHY.youFoundMeTiming.exitStart.toFixed(3)} / {DOOR_CHOREOGRAPHY.youFoundMeTiming.exitComplete.toFixed(3)}</div>
      <div className="mt-1 w-64 max-w-[calc(100vw-2rem)] font-mono text-[11px] normal-case tracking-normal text-white/75">
        LEFT |<span className="relative inline-block w-32 border-b border-white/45 align-middle">
          <span
            className="absolute -top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-white"
            style={{ left: `${((look.dampedLookX + 1) / 2) * 100}%` }}
          />
        </span>| RIGHT
      </div>
      <div>scroll distance {isMobile ? DOOR_CHOREOGRAPHY.scroll.mobileDistance : DOOR_CHOREOGRAPHY.scroll.distance}</div>
      <div>logo reveal {DOOR_CHOREOGRAPHY.finalLogo.revealStart.toFixed(2)}-{DOOR_CHOREOGRAPHY.finalLogo.revealEnd.toFixed(2)}</div>
    </div>
  );
}
