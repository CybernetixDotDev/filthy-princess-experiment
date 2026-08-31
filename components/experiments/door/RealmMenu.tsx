"use client";

import { Html, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import Link from "next/link";
import { useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";

import { DOOR_CHOREOGRAPHY } from "@/components/experiments/door/doorConfig";
import { usePrefersReducedMotion } from "@/lib/animation/usePrefersReducedMotion";

const menuItems = DOOR_CHOREOGRAPHY.realmMenu.items;
const menuSources = menuItems.map((item) => item.asset);
menuSources.forEach((source) => useTexture.preload(source));

type RealmMenuProps = {
  progress: number;
  progressRef: MutableRefObject<number>;
  pointerRef: MutableRefObject<{ x: number; y: number }>;
};

export function RealmMenu({ progress, progressRef, pointerRef }: RealmMenuProps) {
  const textures = useTexture(menuSources);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <group>
      {menuItems.map((item, index) => (
        <RealmMenuItem
          key={item.id}
          item={item}
          texture={textures[index]}
          progress={progress}
          progressRef={progressRef}
          pointerRef={pointerRef}
          reducedMotion={reducedMotion}
          isHovered={hoveredId === item.id}
          isDimmed={hoveredId !== null && hoveredId !== item.id}
          onHover={setHoveredId}
        />
      ))}
    </group>
  );
}

type RealmMenuItemProps = {
  item: (typeof menuItems)[number];
  texture: THREE.Texture;
  progress: number;
  progressRef: MutableRefObject<number>;
  pointerRef: MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
  isHovered: boolean;
  isDimmed: boolean;
  onHover: (id: string | null) => void;
};

function RealmMenuItem({
  item,
  texture,
  progress,
  progressRef,
  pointerRef,
  reducedMotion,
  isHovered,
  isDimmed,
  onHover,
}: RealmMenuItemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const hoverProgressRef = useRef(0);
  const { size } = useThree();
  const aspect = size.width / Math.max(size.height, 1);
  const isMobile = aspect < 0.8;
  const finalPosition = isMobile ? item.mobilePosition : item.position;
  const finalScale = isMobile ? item.mobileScale : item.scale;
  const reveal = smoothstep(item.revealAt, item.revealAt + item.revealDuration, progress);
  const isVisible = reveal > 0.01;
  const targetOpacity = isDimmed ? 0.68 : 1;
  const configuredTexture = useMemo(() => {
    const nextTexture = texture.clone();
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.minFilter = THREE.LinearMipmapLinearFilter;
    nextTexture.magFilter = THREE.LinearFilter;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [texture]);
  const imageAspect = getTextureAspect(configuredTexture);
  const initialPosition = useMemo(
    () => [finalPosition[0], finalPosition[1] - 0.08, finalPosition[2] - 0.22] as const,
    [finalPosition],
  );

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const glow = glowRef.current;

    if (!group) {
      return;
    }

    const currentProgress = progressRef.current;
    const currentReveal = smoothstep(
      item.revealAt,
      item.revealAt + item.revealDuration,
      currentProgress,
    );
    const float = reducedMotion
      ? 0
      : Math.sin(clock.getElapsedTime() * item.floatSpeed + item.depth * 4) *
        item.floatAmount *
        DOOR_CHOREOGRAPHY.realmMenu.floatStrength;
    const pointer = reducedMotion
      ? { x: 0, y: 0 }
      : {
          x: pointerRef.current.x * DOOR_CHOREOGRAPHY.realmMenu.parallaxStrength * item.parallaxFactor,
          y: -pointerRef.current.y * DOOR_CHOREOGRAPHY.realmMenu.parallaxStrength * item.parallaxFactor,
        };
    const hoverScale = isHovered ? 1.9 : isDimmed ? 0.98 : 1;
    const hoverXCorrection = isHovered ? THREE.MathUtils.clamp(-finalPosition[0] * 0.1, -0.1, 0.1) : 0;
    const hoverYCorrection = isHovered && finalPosition[1] > 0.9 ? -0.08 : isHovered && finalPosition[1] < -0.6 ? 0.08 : 0;

    group.position.x = THREE.MathUtils.lerp(initialPosition[0], finalPosition[0], currentReveal) + pointer.x + hoverXCorrection;
    group.position.y = THREE.MathUtils.lerp(initialPosition[1], finalPosition[1], currentReveal) + float + pointer.y + hoverYCorrection;
    group.position.z = THREE.MathUtils.lerp(initialPosition[2], finalPosition[2], currentReveal) + item.depth + (isHovered ? 0.18 : 0);
    group.rotation.z = item.rotation[2] + (reducedMotion ? 0 : Math.sin(clock.getElapsedTime() * item.floatSpeed) * 0.008);
    const desiredScale = finalScale * hoverScale;
    const currentScale = group.scale.x;
    group.scale.setScalar(THREE.MathUtils.lerp(currentScale, THREE.MathUtils.lerp(0.82, desiredScale, currentReveal), 0.14));

    const hoverProgress = THREE.MathUtils.lerp(hoverProgressRef.current, isHovered ? 1 : 0, 0.14);
    hoverProgressRef.current = hoverProgress;
    if (glow) {
      const glowMaterial = glow.material as THREE.MeshBasicMaterial;
      glowMaterial.opacity = hoverProgress * 0.16;
      const glowScale = 1 + hoverProgress * 0.08;
      glow.scale.set(imageAspect * 0.72 * glowScale, 0.72 * glowScale, 1);
    }
  });

  return (
    <group ref={groupRef} position={initialPosition} visible={isVisible}>
      <mesh ref={glowRef} renderOrder={isHovered ? 19 : 9} scale={[imageAspect * 0.72, 0.72, 1]}>
        <circleGeometry args={[1, 40]} />
        <meshBasicMaterial
          color="#ff9db8"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>
      <mesh
        renderOrder={isHovered ? 20 : 10}
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover(item.id);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          onHover(null);
        }}
        onClick={(event) => {
          event.stopPropagation();
          window.location.href = item.href;
        }}
      >
        <planeGeometry args={[imageAspect, 1]} />
        <meshBasicMaterial
          map={configuredTexture}
          transparent
          opacity={reveal * targetOpacity}
          alphaTest={0.01}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>
      <Html center transform position={[0, 0, 0.03]} pointerEvents={isVisible ? "auto" : "none"}>
        <Link
          href={item.href}
          aria-label={item.label}
          tabIndex={isVisible ? 0 : -1}
          onMouseEnter={() => onHover(item.id)}
          onMouseLeave={() => onHover(null)}
          className="block h-[100px] w-[100px] rounded-full outline-none focus-visible:ring-1 focus-visible:ring-white/75 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
        />
      </Html>
    </group>
  );
}

function getTextureAspect(texture: THREE.Texture) {
  const image = texture.image as { width?: number; height?: number } | undefined;

  return image?.width && image.height ? image.width / image.height : 1;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);

  return x * x * (3 - 2 * x);
}
