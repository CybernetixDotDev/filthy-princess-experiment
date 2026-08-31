"use client";

import { ExperimentShell } from "@/components/experiments/ExperimentShell";
import { ThreeCanvasMount } from "@/components/three/ThreeCanvasMount";

const planes = [
  { position: [0, 1.4, -1.5], scale: [3.2, 0.9, 1], color: "#202020" },
  { position: [-0.9, 0, -3.1], scale: [2.5, 0.75, 1], color: "#181818" },
  { position: [0.7, -1.45, -4.8], scale: [3.8, 1.1, 1], color: "#101010" },
] as const;

function FallPlaceholder() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[0, 4, 4]} intensity={1.4} />
      {planes.map((plane, index) => (
        <mesh
          key={`${plane.position.join(":")}-${index}`}
          position={plane.position}
          scale={plane.scale}
          rotation={[0.08 * index, 0, -0.04 * index]}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial color={plane.color} side={2} roughness={0.9} />
        </mesh>
      ))}
    </>
  );
}

export function FallExperiment() {
  return (
    <ExperimentShell label="Fall">
      <ThreeCanvasMount camera={{ position: [0, 0, 5.5], fov: 50 }}>
        <FallPlaceholder />
      </ThreeCanvasMount>
    </ExperimentShell>
  );
}
