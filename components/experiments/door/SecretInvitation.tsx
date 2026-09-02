"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

import { DOOR_CHOREOGRAPHY } from "@/components/experiments/door/doorConfig";
import { secretInviteConfig } from "@/components/secret-invite/secretInviteConfig";
import { usePrefersReducedMotion } from "@/lib/animation/usePrefersReducedMotion";

export type SecretDebugState = {
  windowActive: boolean;
  lifecycleActive: boolean;
  visible: boolean;
  interactive: boolean;
  progress: number;
  opacity: number;
  position: [number, number, number];
  width: number;
  centeredRightEdge: number;
  insideCurrentFrustum: boolean;
  fullyInsideCurrentFrustum: boolean;
  glowIntensity: number;
};

type SecretInvitationProps = {
  progress: number;
  debugRef?: MutableRefObject<SecretDebugState>;
  invitationActivationSuppressedRef: MutableRefObject<boolean>;
};

export function SecretInvitation({
  progress,
  debugRef,
  invitationActivationSuppressedRef,
}: SecretInvitationProps) {
  const texture = useTexture(DOOR_CHOREOGRAPHY.secretInvite.src);
  const { camera, size } = useThree();
  const reducedMotion = usePrefersReducedMotion();
  const invitationMeshRef = useRef<THREE.Mesh>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);
  const animationTimeRef = useRef(0);
  const isMobile = size.width / Math.max(size.height, 1) < 0.8;
  const position = isMobile
    ? DOOR_CHOREOGRAPHY.secretInvite.mobilePosition
    : DOOR_CHOREOGRAPHY.secretInvite.desktopPosition;
  const scale = isMobile ? 1 : DOOR_CHOREOGRAPHY.secretInvite.desktopScale;
  const lifecycleActive = isSecretLifecycleActive(progress);
  const opacity = getSecretOpacity(progress);
  const secretVisible = lifecycleActive && opacity > 0.001;
  const canActivate = lifecycleActive && opacity > 0.001;
  const effectiveOpacity = opacity;
  const imageAspect = useMemo(() => {
    const image = texture.image as { width: number; height: number };
    return image.width / image.height;
  }, [texture]);
  const width = DOOR_CHOREOGRAPHY.secretInvite.width * scale;
  const height = width / imageAspect;
  const glowPosition = [
    position[0] + DOOR_CHOREOGRAPHY.secretInvite.glowPosition[0] * scale,
    position[1] + DOOR_CHOREOGRAPHY.secretInvite.glowPosition[1] * scale,
    position[2] + DOOR_CHOREOGRAPHY.secretInvite.glowPosition[2] * scale,
  ] as [number, number, number];

  useFrame((_, delta) => {
    if (!secretInviteConfig.active) return;

    animationTimeRef.current += delta;
    const modulation = reducedMotion
      ? 1
      : 0.91 + Math.sin(animationTimeRef.current * 0.73) * 0.045 + Math.sin(animationTimeRef.current * 1.31) * 0.02;
    const currentLifecycleActive = isSecretLifecycleActive(progress);
    const currentOpacity = getSecretOpacity(progress);
    const currentEffectiveOpacity = currentOpacity;
    const currentVisible = currentLifecycleActive && currentEffectiveOpacity > 0.001;
    const glowIntensity = DOOR_CHOREOGRAPHY.secretInvite.glowIntensity * currentEffectiveOpacity * modulation;
    if (invitationMeshRef.current) {
      invitationMeshRef.current.visible = currentVisible;
      const material = invitationMeshRef.current.material;
      if (material instanceof THREE.MeshBasicMaterial) material.opacity = currentEffectiveOpacity;
    }
    if (glowMaterialRef.current) glowMaterialRef.current.opacity = glowIntensity;
    if (glowLightRef.current) glowLightRef.current.intensity = glowIntensity * 1.8;

    if (debugRef) {
      const projected = new THREE.Vector3(position[0], position[1], position[2]).project(camera);
      const visible = opacity > 0 && projected.x > -1 && projected.x < 1 && projected.y > -1 && projected.y < 1 && projected.z > -1 && projected.z < 1;
      const fullyVisible = opacity > 0 && areCornersInsideFrustum(camera, position, DOOR_CHOREOGRAPHY.secretInvite.width, height);
      const visibleHeight = getVisibleHeight(camera, DOOR_CHOREOGRAPHY.sequence.planeZ);
      debugRef.current.windowActive = currentLifecycleActive;
      debugRef.current.lifecycleActive = currentLifecycleActive;
      debugRef.current.visible = currentVisible;
      debugRef.current.interactive = currentVisible;
      debugRef.current.progress = progress;
      debugRef.current.opacity = currentEffectiveOpacity;
      debugRef.current.position = [...position];
      debugRef.current.width = width;
      debugRef.current.centeredRightEdge = (visibleHeight * (size.width / Math.max(size.height, 1))) / 2;
      debugRef.current.insideCurrentFrustum = visible;
      debugRef.current.fullyInsideCurrentFrustum = fullyVisible;
      debugRef.current.glowIntensity = glowIntensity;
    }
  });

  if (!secretInviteConfig.active) return null;

  return (
    <group>
      <mesh
        ref={invitationMeshRef}
        position={position}
        visible={secretVisible}
        renderOrder={isMobile ? 0 : 2}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={effectiveOpacity}
          depthWrite={false}
          depthTest={isMobile}
          toneMapped={false}
        />
      </mesh>
      <Html
        position={position}
        center
        distanceFactor={10}
        style={{ pointerEvents: canActivate ? "auto" : "none" }}
      >
        <a
          href="/secretinvite"
          aria-label="Open the secret invitation"
          tabIndex={canActivate ? 0 : -1}
          onClick={(event) => {
            if (invitationActivationSuppressedRef.current || !canActivate) {
              event.preventDefault();
              event.stopPropagation();
              invitationActivationSuppressedRef.current = false;
            }
          }}
          style={{
            display: "block",
            width: "140px",
            aspectRatio: `${imageAspect}`,
            opacity: 0,
          }}
        />
      </Html>
      <pointLight
        ref={glowLightRef}
        color="#d59a63"
        intensity={0}
        distance={2.8}
        decay={2}
        position={glowPosition}
      />
      <mesh position={glowPosition} scale={DOOR_CHOREOGRAPHY.secretInvite.glowSize}>
        <circleGeometry args={[1, 20]} />
        <meshBasicMaterial
          ref={glowMaterialRef}
          color="#e7b77f"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function areCornersInsideFrustum(camera: THREE.Camera, position: readonly [number, number, number], width: number, height: number) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  return [
    [-halfWidth, -halfHeight],
    [-halfWidth, halfHeight],
    [halfWidth, -halfHeight],
    [halfWidth, halfHeight],
  ].every(([x, y]) => {
    const projected = new THREE.Vector3(position[0] + x, position[1] + y, position[2]).project(camera);
    return projected.x > -1 && projected.x < 1 && projected.y > -1 && projected.y < 1 && projected.z > -1 && projected.z < 1;
  });
}

export function getSecretOpacity(progress: number) {
  const timing = DOOR_CHOREOGRAPHY.secretInvite.lifecycle;
  if (progress < timing.enterStart || progress > timing.exitComplete) return 0;
  if (progress < timing.enterComplete) return smoothstep(timing.enterStart, timing.enterComplete, progress);
  if (progress <= timing.exitStart) return 1;
  return 1 - smoothstep(timing.exitStart, timing.exitComplete, progress);
}

export function isSecretLifecycleActive(progress: number) {
  const timing = DOOR_CHOREOGRAPHY.youFoundMeTiming;
  return progress >= timing.enterStart && progress <= timing.exitComplete;
}

function getVisibleHeight(camera: THREE.Camera, sceneZ: number) {
  const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : DOOR_CHOREOGRAPHY.camera.fov;
  const distance = Math.max(Math.abs(camera.position.z - sceneZ), 0.001);
  return 2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2) * distance;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
}
