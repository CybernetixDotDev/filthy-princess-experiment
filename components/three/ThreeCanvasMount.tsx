"use client";

import dynamic from "next/dynamic";

import type { ThreeCanvasProps } from "@/components/three/ThreeCanvas";

const ClientThreeCanvas = dynamic(
  () => import("@/components/three/ThreeCanvas").then((mod) => mod.ThreeCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center bg-black font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
        Loading WebGL
      </div>
    ),
  },
);

export function ThreeCanvasMount(props: ThreeCanvasProps) {
  return <ClientThreeCanvas {...props} />;
}
