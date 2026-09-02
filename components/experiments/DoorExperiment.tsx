"use client";

import { useEffect, useRef, useState } from "react";

import { useCinematicLook } from "@/components/cinematic/useCinematicLook";
import { DoorCopy } from "@/components/experiments/door/DoorCopy";
import { DoorDebugReadout } from "@/components/experiments/door/DoorDebugReadout";
import { DoorFinalLogo } from "@/components/experiments/door/DoorFinalLogo";
import { DoorScene, type CameraDebugState } from "@/components/experiments/door/DoorScene";
import type { SecretDebugState } from "@/components/experiments/door/SecretInvitation";
import { DOOR_CHOREOGRAPHY } from "@/components/experiments/door/doorConfig";
import { ExperimentShell } from "@/components/experiments/ExperimentShell";
import { ThreeCanvasMount } from "@/components/three/ThreeCanvasMount";
import { registerScrollTrigger, ScrollTrigger } from "@/lib/animation/gsap";
import { usePrefersReducedMotion } from "@/lib/animation/usePrefersReducedMotion";

export function DoorExperiment() {
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const cameraDebugRef = useRef<CameraDebugState>({
    fov: DOOR_CHOREOGRAPHY.camera.fov,
    aspect: 1,
    position: [0, 0, DOOR_CHOREOGRAPHY.camera.position[2]],
    yaw: 0,
    sceneDistance: DOOR_CHOREOGRAPHY.camera.position[2],
    visibleHeight: 0,
    visibleWidth: 0,
    maxLookX: 0,
    lookFraction: DOOR_CHOREOGRAPHY.pointerCamera.desktopViewportFraction,
  });
  const secretDebugRef = useRef<SecretDebugState>({
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
  const look = useCinematicLook({ stageRef, reducedMotion });


  useEffect(() => {
    const debugFrame = window.requestAnimationFrame(() => {
      setDebugEnabled(new URLSearchParams(window.location.search).get("debug") === "1");
    });
    registerScrollTrigger();

    const stageElement = stageRef.current;

    if (!stageElement) {
      window.cancelAnimationFrame(debugFrame);
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: stageElement,
      start: "top top",
      end: `+=${getScrollDistance()}`,
      pin: true,
      pinSpacing: true,
      scrub: DOOR_CHOREOGRAPHY.scroll.scrub,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        setProgress(self.progress);
        setIsPinned(self.isActive);
      },
      onToggle: (self) => {
        setIsPinned(self.isActive);
      },
    });

    return () => {
      window.cancelAnimationFrame(debugFrame);
      trigger.kill();
    };
  }, []);

  return (
    <ExperimentShell>
      <div ref={stageRef} className="relative h-dvh overflow-hidden bg-black" style={{ touchAction: "pan-y" }}>
        <ThreeCanvasMount camera={DOOR_CHOREOGRAPHY.camera}>
          <DoorScene
            progress={progress}
            progressRef={progressRef}
            cameraDebugRef={cameraDebugRef}
            lookRef={look.lookRef}
            invitationActivationSuppressedRef={look.invitationActivationSuppressedRef}
            lookDebugRef={look.debugRef}
            debugMode={debugEnabled}
            secretDebugRef={secretDebugRef}
          />
        </ThreeCanvasMount>
        <DoorCopy progress={progress} />
        <DoorFinalLogo progress={progress} />
        <DoorDebugReadout
          progress={progress}
          pinned={isPinned}
          cameraDebugRef={cameraDebugRef}
          lookDebugRef={look.debugRef}
          secretDebugRef={secretDebugRef}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.18)_66%,rgba(0,0,0,0.72)_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-soft-light [background-image:repeating-radial-gradient(circle_at_17%_23%,rgba(255,255,255,0.72)_0,rgba(255,255,255,0.72)_1px,transparent_1px,transparent_4px)]" />
      </div>
    </ExperimentShell>
  );
}

function getScrollDistance() {
  return window.matchMedia("(max-width: 767px)").matches
    ? DOOR_CHOREOGRAPHY.scroll.mobileDistance
    : DOOR_CHOREOGRAPHY.scroll.distance;
}
