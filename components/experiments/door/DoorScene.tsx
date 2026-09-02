"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

import type { CinematicLookDebug } from "@/components/cinematic/useCinematicLook";
import { DOOR_CHOREOGRAPHY } from "@/components/experiments/door/doorConfig";
import { getDoorTextureBlend } from "@/components/experiments/door/doorProgress";
import { SecretInvitation, type SecretDebugState } from "@/components/experiments/door/SecretInvitation";
import { usePrefersReducedMotion } from "@/lib/animation/usePrefersReducedMotion";

type DoorSceneProps = {
  progress: number;
  progressRef: MutableRefObject<number>;
  cameraDebugRef?: MutableRefObject<CameraDebugState>;
  lookRef: MutableRefObject<{ x: number; y: number }>;
  invitationActivationSuppressedRef: MutableRefObject<boolean>;
  lookDebugRef: MutableRefObject<CinematicLookDebug>;
  debugMode: boolean;
  secretDebugRef?: MutableRefObject<SecretDebugState>;
};

export type CameraDebugState = {
  fov: number;
  aspect: number;
  position: [number, number, number];
  yaw: number;
  sceneDistance: number;
  visibleHeight: number;
  visibleWidth: number;
  maxLookX: number;
  lookFraction: number;
};

export function DoorScene({
  progress,
  progressRef,
  cameraDebugRef,
  lookRef,
  invitationActivationSuppressedRef,
  lookDebugRef,
  debugMode,
  secretDebugRef,
}: DoorSceneProps) {
  const reducedMotion = usePrefersReducedMotion();
  const pointerOffsetRef = useRef({ x: 0, y: 0 });
  const { camera, size, invalidate } = useThree();
  const dustPositions = useMemo(
    () => createDustPositions(DOOR_CHOREOGRAPHY.atmosphere.dustCount),
    [],
  );

  useEffect(() => {
    if (!reducedMotion) return;

    applyCameraProgress({
      camera,
      progress,
      aspect: size.width / Math.max(size.height, 1),
      pointerOffset: { x: 0, y: 0 },
      reducedMotion,
      cameraDebugRef,
      lookX: 0,
      lookY: 0,
    });
    invalidate();
  }, [camera, cameraDebugRef, invalidate, progress, reducedMotion, size.height, size.width]);

  useFrame(() => {
    if (reducedMotion) {
      return;
    }

    const pointerTarget = lookRef.current;
    const aspect = size.width / Math.max(size.height, 1);
    const isMobile = aspect < 0.8;
    const lookMetrics = getLookMetrics(camera, aspect, isMobile);
    const horizontalStrength = lookMetrics.maxLookX;
    const verticalStrength = lookMetrics.maxLookY;
    const isActiveTouchLook = isMobile
      && lookDebugRef.current.inputType === "touch"
      && lookDebugRef.current.gestureIntent === "look"
      && lookDebugRef.current.pointerDown;
    const lookDamping = isActiveTouchLook
      ? DOOR_CHOREOGRAPHY.pointerCamera.activeTouchDamping
      : DOOR_CHOREOGRAPHY.pointerCamera.releaseDamping;
    const finalLogoProgress = smoothstep(
      DOOR_CHOREOGRAPHY.finalLogo.revealStart,
      DOOR_CHOREOGRAPHY.finalLogo.revealEnd,
      progressRef.current,
    );
    const lookScale = THREE.MathUtils.lerp(
      1,
      DOOR_CHOREOGRAPHY.pointerCamera.finalLogoScale,
      finalLogoProgress,
    );
    pointerOffsetRef.current.x = THREE.MathUtils.lerp(
      pointerOffsetRef.current.x,
      pointerTarget.x * horizontalStrength * lookScale,
      lookDamping,
    );
    pointerOffsetRef.current.y = THREE.MathUtils.lerp(
      pointerOffsetRef.current.y,
      pointerTarget.y * verticalStrength * lookScale,
      lookDamping,
    );
    lookDebugRef.current.activeTouchDamping = DOOR_CHOREOGRAPHY.pointerCamera.activeTouchDamping;
    lookDebugRef.current.releaseDamping = DOOR_CHOREOGRAPHY.pointerCamera.releaseDamping;
    lookDebugRef.current.maxLookRange = horizontalStrength * lookScale;
    lookDebugRef.current.dampedLookX = pointerOffsetRef.current.x / Math.max(horizontalStrength, 0.0001);
    lookDebugRef.current.dampedLookY = pointerOffsetRef.current.y / Math.max(verticalStrength, 0.0001);

    applyCameraProgress({
      camera,
      progress: progressRef.current,
      aspect: size.width / Math.max(size.height, 1),
      pointerOffset: pointerOffsetRef.current,
      reducedMotion,
      cameraDebugRef,
      lookX: pointerOffsetRef.current.x / Math.max(horizontalStrength * lookScale, 0.0001),
      lookY: pointerOffsetRef.current.y / Math.max(verticalStrength * lookScale, 0.0001),
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
      <SecretInvitation
        progress={progress}
        debugRef={secretDebugRef}
        invitationActivationSuppressedRef={invitationActivationSuppressedRef}
      />
      {debugMode ? <LookDebugObject /> : null}
    </>
  );
}

function DoorArtworkSequence({ progress }: { progress: number }) {
  const { size } = useThree();
  const textures = useTexture(
    DOOR_CHOREOGRAPHY.sequence.frames.map((frame) => frame.src),
  );
  const blend = getDoorTextureBlend(progress);
  const mobileScale = size.width < 768 ? DOOR_CHOREOGRAPHY.mobile.planeScale : 1;

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
  pointerOffset,
  reducedMotion,
  cameraDebugRef,
  lookX,
  lookY,
}: {
  camera: THREE.Camera;
  progress: number;
  aspect: number;
  pointerOffset: { x: number; y: number };
  reducedMotion: boolean;
  cameraDebugRef?: MutableRefObject<CameraDebugState>;
  lookX: number;
  lookY: number;
}) {
  const isMobile = aspect < 0.8;
  if (camera instanceof THREE.PerspectiveCamera) {
    const targetFov = isMobile ? DOOR_CHOREOGRAPHY.mobile.cameraFov : DOOR_CHOREOGRAPHY.camera.fov;
    if (camera.fov !== targetFov) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }
  }
  const target = getCameraTarget(progress, aspect, reducedMotion, isMobile);
  const lookMetrics = getLookMetrics(camera, aspect, isMobile);
  const pointerScale = reducedMotion ? 0 : 1;
  const pointerX = pointerOffset.x * pointerScale;
  const pointerY = pointerOffset.y * pointerScale;
  const desiredPosition = new THREE.Vector3(
    target.x + pointerX,
    target.y + pointerY,
    target.z,
  );

  camera.position.lerp(desiredPosition, reducedMotion ? 1 : DOOR_CHOREOGRAPHY.pointerCamera.cameraLerp);
  camera.lookAt(
    DOOR_CHOREOGRAPHY.path.lookAt[0] + pointerX * DOOR_CHOREOGRAPHY.pointerCamera.targetFollow,
    DOOR_CHOREOGRAPHY.path.lookAt[1] + pointerY * DOOR_CHOREOGRAPHY.pointerCamera.targetFollow,
    DOOR_CHOREOGRAPHY.path.lookAt[2],
  );
  if (!reducedMotion) {
    camera.rotation.y += lookX * DOOR_CHOREOGRAPHY.pointerCamera.yaw;
    camera.rotation.x += lookY * DOOR_CHOREOGRAPHY.pointerCamera.pitch;
  }
  if (cameraDebugRef) {
    cameraDebugRef.current.fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : 0;
    cameraDebugRef.current.aspect = aspect;
    cameraDebugRef.current.position = [camera.position.x, camera.position.y, camera.position.z];
    cameraDebugRef.current.yaw = camera.rotation.y;
    cameraDebugRef.current.sceneDistance = lookMetrics.distance;
    cameraDebugRef.current.visibleHeight = lookMetrics.visibleHeight;
    cameraDebugRef.current.visibleWidth = lookMetrics.visibleWidth;
    cameraDebugRef.current.maxLookX = lookMetrics.maxLookX;
    cameraDebugRef.current.lookFraction = lookMetrics.fraction;
  }
}

function getLookMetrics(camera: THREE.Camera, aspect: number, isMobile: boolean) {
  const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : DOOR_CHOREOGRAPHY.camera.fov;
  const distance = Math.max(Math.abs(camera.position.z - DOOR_CHOREOGRAPHY.sequence.planeZ), 0.001);
  const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2) * distance;
  const visibleWidth = visibleHeight * aspect;
  const fraction = isMobile
    ? DOOR_CHOREOGRAPHY.pointerCamera.mobileViewportFraction
    : DOOR_CHOREOGRAPHY.pointerCamera.desktopViewportFraction;

  const verticalFraction = isMobile
    ? DOOR_CHOREOGRAPHY.pointerCamera.mobileVerticalFraction
    : DOOR_CHOREOGRAPHY.pointerCamera.desktopVerticalFraction;

  return {
    distance,
    visibleHeight,
    visibleWidth,
    fraction,
    maxLookX: visibleWidth * fraction,
    maxLookY: visibleHeight * verticalFraction,
  };
}

function LookDebugObject() {
  const { camera, size } = useThree();
  const aspect = size.width / Math.max(size.height, 1);
  const isMobile = aspect < 0.8;
  const metrics = getLookMetrics(camera, aspect, isMobile);
  const width = 0.8;
  const height = 1.2;
  const x = metrics.visibleWidth / 2 + width / 2 + 0.05;

  return (
    <mesh position={[x, 0, DOOR_CHOREOGRAPHY.sequence.planeZ + 0.04]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial color="#ff2f8f" wireframe transparent opacity={0.95} />
    </mesh>
  );
}

function getCameraTarget(
  progress: number,
  aspect: number,
  reducedMotion: boolean,
  isMobile: boolean,
) {
  const path = DOOR_CHOREOGRAPHY.path;
  const cameraPath = isMobile ? path.mobile : path;
  const cameraProgress = reducedMotion ? Math.min(progress, 0.9) : progress;
  const point =
    cameraProgress < 0.15
      ? interpolate(cameraPath.start, cameraPath.start, smoothstep(0, 0.15, cameraProgress))
      : cameraProgress < 0.4
        ? interpolate(cameraPath.start, cameraPath.slowApproach, smoothstep(0.15, 0.4, cameraProgress))
        : cameraProgress < 0.68
          ? interpolate(cameraPath.slowApproach, cameraPath.imposing, smoothstep(0.4, 0.68, cameraProgress))
          : cameraProgress < 0.8
            ? interpolate(cameraPath.imposing, cameraPath.threshold, smoothstep(0.68, 0.8, cameraProgress))
            : interpolate(cameraPath.threshold, cameraPath.crossing, smoothstep(0.8, 1, cameraProgress));

  return {
    x: point.x,
    y: point.y,
    z: point.z,
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
