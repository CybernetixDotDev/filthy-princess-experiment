"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

import { DOOR_CHOREOGRAPHY } from "@/components/experiments/door/doorConfig";
import { getDoorTextureBlend } from "@/components/experiments/door/doorProgress";
import { usePrefersReducedMotion } from "@/lib/animation/usePrefersReducedMotion";

type DoorSceneProps = {
  progress: number;
  progressRef: MutableRefObject<number>;
};

export function DoorScene({ progress, progressRef }: DoorSceneProps) {
  const reducedMotion = usePrefersReducedMotion();
  const pointerRef = useRef({ x: 0, y: 0 });
  const { camera, size, invalidate } = useThree();
  const dustPositions = useMemo(
    () => createDustPositions(DOOR_CHOREOGRAPHY.atmosphere.dustCount),
    [],
  );

  useEffect(() => {
    if (reducedMotion) {
      applyCameraProgress({
        camera,
        progress,
        aspect: size.width / Math.max(size.height, 1),
        pointer: { x: 0, y: 0 },
        reducedMotion,
      });
      invalidate();
    }
  }, [camera, invalidate, progress, reducedMotion, size.height, size.width]);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return;
      }

      pointerRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [reducedMotion]);

  useFrame(() => {
    if (reducedMotion) {
      return;
    }

    applyCameraProgress({
      camera,
      progress: progressRef.current,
      aspect: size.width / Math.max(size.height, 1),
      pointer: pointerRef.current,
      reducedMotion,
    });
  });

  return (
    <>
      <fog
        attach="fog"
        args={[
          DOOR_CHOREOGRAPHY.atmosphere.fogColor,
          DOOR_CHOREOGRAPHY.atmosphere.fogNear,
          DOOR_CHOREOGRAPHY.atmosphere.fogFar,
        ]}
      />
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.08} />
      <DoorArtworkSequence progress={progress} />
      <Dust positions={dustPositions} />
    </>
  );
}

function DoorArtworkSequence({ progress }: { progress: number }) {
  const { size } = useThree();
  const textures = useTexture(
    DOOR_CHOREOGRAPHY.sequence.frames.map((frame) => frame.src),
  );
  const blend = getDoorTextureBlend(progress);
  const mobileScale =
    size.width / Math.max(size.height, 1) < 0.8
      ? DOOR_CHOREOGRAPHY.sequence.mobileScale
      : 1;

  return (
    <group
      position={[0, 0, DOOR_CHOREOGRAPHY.sequence.planeZ]}
      scale={[mobileScale, mobileScale, 1]}
    >
      <DoorFramePlane texture={textures[blend.currentIndex]} opacity={1 - blend.mix} />
      <DoorFramePlane texture={textures[blend.nextIndex]} opacity={blend.mix} zOffset={0.01} />
    </group>
  );
}

function DoorFramePlane({
  texture,
  opacity,
  zOffset = 0,
}: {
  texture: THREE.Texture;
  opacity: number;
  zOffset?: number;
}) {
  return (
    <mesh position={[0, 0, zOffset]}>
      <planeGeometry
        args={[
          DOOR_CHOREOGRAPHY.sequence.planeWidth,
          DOOR_CHOREOGRAPHY.sequence.planeHeight,
        ]}
      />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Dust({ positions }: { positions: Float32Array }) {
  return (
    <points position={[0, 0, 1.5]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#d9a1b5"
        size={0.014}
        transparent
        opacity={DOOR_CHOREOGRAPHY.atmosphere.dustOpacity}
        depthWrite={false}
      />
    </points>
  );
}

function applyCameraProgress({
  camera,
  progress,
  aspect,
  pointer,
  reducedMotion,
}: {
  camera: THREE.Camera;
  progress: number;
  aspect: number;
  pointer: { x: number; y: number };
  reducedMotion: boolean;
}) {
  const target = getCameraTarget(progress, aspect, reducedMotion);
  const parallaxScale = reducedMotion ? 0 : 1 - smoothstep(0.72, 1, progress);
  const parallaxX = pointer.x * DOOR_CHOREOGRAPHY.parallax.x * parallaxScale;
  const parallaxY = -pointer.y * DOOR_CHOREOGRAPHY.parallax.y * parallaxScale;
  const desiredPosition = new THREE.Vector3(
    target.x + parallaxX,
    target.y + parallaxY,
    target.z,
  );

  camera.position.lerp(desiredPosition, reducedMotion ? 1 : 0.08);
  camera.lookAt(
    DOOR_CHOREOGRAPHY.path.lookAt[0] + parallaxX * 0.28,
    DOOR_CHOREOGRAPHY.path.lookAt[1] + parallaxY * 0.22,
    DOOR_CHOREOGRAPHY.path.lookAt[2],
  );
}

function getCameraTarget(progress: number, aspect: number, reducedMotion: boolean) {
  const path = DOOR_CHOREOGRAPHY.path;
  const mobileAdjustment = aspect < 0.8;
  const cameraProgress = reducedMotion ? Math.min(progress, 0.9) : progress;
  const point =
    cameraProgress < 0.15
      ? interpolate(path.start, path.start, smoothstep(0, 0.15, cameraProgress))
      : cameraProgress < 0.4
        ? interpolate(path.start, path.slowApproach, smoothstep(0.15, 0.4, cameraProgress))
        : cameraProgress < 0.7
          ? interpolate(path.slowApproach, path.imposing, smoothstep(0.4, 0.7, cameraProgress))
          : cameraProgress < 0.88
            ? interpolate(path.imposing, path.threshold, smoothstep(0.7, 0.88, cameraProgress))
            : interpolate(path.threshold, path.crossing, smoothstep(0.88, 1, cameraProgress));

  return {
    x: point.x,
    y: point.y + (mobileAdjustment ? path.mobileYOffset : 0),
    z: point.z + (mobileAdjustment ? path.mobileZOffset : 0),
  };
}

function interpolate(
  from: readonly [number, number, number],
  to: readonly [number, number, number],
  progress: number,
) {
  return {
    x: THREE.MathUtils.lerp(from[0], to[0], progress),
    y: THREE.MathUtils.lerp(from[1], to[1], progress),
    z: THREE.MathUtils.lerp(from[2], to[2], progress),
  };
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);

  return x * x * (3 - 2 * x);
}

function createDustPositions(count: number) {
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 9;
    positions[index * 3 + 1] = Math.random() * 5.4 - 2.7;
    positions[index * 3 + 2] = Math.random() * 9 - 1.5;
  }

  return positions;
}
