"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { DOOR_CHOREOGRAPHY } from "@/components/experiments/door/doorConfig";
import { motion } from "@/lib/animation/motion";

type DoorFinalLogoProps = {
  progress: number;
};

type LogoStyle = CSSProperties & {
  "--logo-width-desktop": string;
  "--logo-width-tablet": string;
  "--logo-width-mobile": string;
  "--logo-max-width": string;
};

export function DoorFinalLogo({ progress }: DoorFinalLogoProps) {
  const logo = DOOR_CHOREOGRAPHY.finalLogo;
  const revealProgress = smoothstep(logo.revealStart, logo.revealEnd, progress);
  const settleProgress = smoothstep(logo.revealEnd, 1, progress);
  const scale = lerp(logo.scaleFrom, logo.scaleTo, revealProgress);
  const y = lerp(18, 0, revealProgress) - settleProgress * 2;
  const isInteractive = progress >= logo.revealEnd;
  const style: LogoStyle = {
    "--logo-width-desktop": logo.widthDesktop,
    "--logo-width-tablet": logo.widthTablet,
    "--logo-width-mobile": logo.widthMobile,
    "--logo-max-width": logo.maxWidth,
    left: "50%",
    top: logo.verticalPosition,
    pointerEvents: isInteractive ? "auto" : "none",
  };

  return (
    <Link
      href={logo.href}
      aria-label={logo.ariaLabel}
      tabIndex={isInteractive ? 0 : -1}
      className="absolute z-20 block w-[var(--logo-width-mobile)] max-w-[var(--logo-max-width)] -translate-x-1/2 -translate-y-1/2 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-white/75 focus-visible:ring-offset-8 focus-visible:ring-offset-black sm:w-[var(--logo-width-tablet)] lg:w-[var(--logo-width-desktop)]"
      style={style}
    >
      <motion.div
        aria-hidden={!isInteractive}
        style={{
          opacity: revealProgress,
          transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
          filter: `drop-shadow(0 0 ${lerp(12, 28, revealProgress)}px rgba(255, 168, 191, 0.24))`,
        }}
      >
        <Image
          src={logo.src}
          alt={logo.alt}
          width={1536}
          height={1024}
          className="h-auto w-full select-none"
          draggable={false}
        />
      </motion.div>
    </Link>
  );
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);

  return x * x * (3 - 2 * x);
}
