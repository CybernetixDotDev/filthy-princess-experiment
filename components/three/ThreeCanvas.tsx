"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/lib/animation/usePrefersReducedMotion";
import { DEFAULT_DPR, REDUCED_MOTION_DPR } from "@/lib/three/constants";
import { useWebGLAvailable } from "@/lib/three/useWebGLAvailable";
import { cn } from "@/lib/utils";

export type ThreeCanvasProps = {
  children: ReactNode;
  camera?: CanvasProps["camera"];
  className?: string;
  fallback?: ReactNode;
};

const defaultCamera: CanvasProps["camera"] = {
  position: [0, 0, 5],
  fov: 45,
  near: 0.1,
  far: 100,
};

export function ThreeCanvas({
  children,
  camera = defaultCamera,
  className,
  fallback,
}: ThreeCanvasProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const webGLAvailable = useWebGLAvailable();

  if (webGLAvailable === false) {
    return (
      <div className="grid h-full min-h-dvh w-full place-items-center bg-black px-6 text-center font-mono text-xs uppercase tracking-[0.2em] text-white/45">
        {fallback ?? "WebGL is unavailable in this browser."}
      </div>
    );
  }

  if (webGLAvailable === null) {
    return (
      <div className="grid h-full min-h-dvh w-full place-items-center bg-black font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
        Preparing WebGL
      </div>
    );
  }

  return (
    <Canvas
      className={cn("h-full min-h-dvh w-full bg-black", className)}
      camera={camera}
      dpr={prefersReducedMotion ? REDUCED_MOTION_DPR : DEFAULT_DPR}
      frameloop={prefersReducedMotion ? "demand" : "always"}
      gl={{
        antialias: !prefersReducedMotion,
        alpha: false,
        powerPreference: prefersReducedMotion ? "low-power" : "high-performance",
      }}
    >
      <color attach="background" args={["#000000"]} />
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
