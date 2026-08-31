"use client";

import { useEffect, useRef, useState } from "react";

import { DoorCopy } from "@/components/experiments/door/DoorCopy";
import { DoorDebugReadout } from "@/components/experiments/door/DoorDebugReadout";
import { DoorFinalLogo } from "@/components/experiments/door/DoorFinalLogo";
import { DoorScene } from "@/components/experiments/door/DoorScene";
import { DOOR_CHOREOGRAPHY } from "@/components/experiments/door/doorConfig";
import { ExperimentShell } from "@/components/experiments/ExperimentShell";
import { ThreeCanvasMount } from "@/components/three/ThreeCanvasMount";
import { registerScrollTrigger, ScrollTrigger } from "@/lib/animation/gsap";

export function DoorExperiment() {
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    registerScrollTrigger();

    const stageElement = stageRef.current;

    if (!stageElement) {
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: stageElement,
      start: "top top",
      end: `+=${DOOR_CHOREOGRAPHY.scroll.distance}`,
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
      trigger.kill();
    };
  }, []);

  return (
    <ExperimentShell>
      <div ref={stageRef} className="relative h-dvh overflow-hidden bg-black">
        <ThreeCanvasMount camera={DOOR_CHOREOGRAPHY.camera}>
          <DoorScene progress={progress} progressRef={progressRef} />
        </ThreeCanvasMount>
        <DoorCopy progress={progress} />
        <DoorFinalLogo progress={progress} />
        <DoorDebugReadout progress={progress} pinned={isPinned} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.18)_66%,rgba(0,0,0,0.72)_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-soft-light [background-image:repeating-radial-gradient(circle_at_17%_23%,rgba(255,255,255,0.72)_0,rgba(255,255,255,0.72)_1px,transparent_1px,transparent_4px)]" />
      </div>
    </ExperimentShell>
  );
}
