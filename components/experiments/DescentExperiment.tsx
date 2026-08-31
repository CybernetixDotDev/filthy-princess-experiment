"use client";

import { useEffect } from "react";

import { ExperimentShell } from "@/components/experiments/ExperimentShell";
import { ThreeCanvasMount } from "@/components/three/ThreeCanvasMount";
import { registerScrollTrigger } from "@/lib/animation/gsap";

function DescentPlaceholderScene() {
  return (
    <>
      <ambientLight intensity={0.28} />
      <pointLight position={[0, 1.5, 2.5]} intensity={4} distance={8} />
      <mesh position={[0, 0, 0]} rotation={[0.2, 0.45, 0]}>
        <boxGeometry args={[1.25, 1.25, 1.25]} />
        <meshStandardMaterial color="#121212" roughness={0.8} metalness={0.15} />
      </mesh>
    </>
  );
}

export function DescentExperiment() {
  useEffect(() => {
    registerScrollTrigger();
  }, []);

  return (
    <ExperimentShell label="Descent">
      <section className="relative min-h-[180dvh]">
        <div className="sticky top-0 h-dvh">
          <ThreeCanvasMount camera={{ position: [0, 0, 5], fov: 45 }}>
            <DescentPlaceholderScene />
          </ThreeCanvasMount>
        </div>
      </section>
    </ExperimentShell>
  );
}
