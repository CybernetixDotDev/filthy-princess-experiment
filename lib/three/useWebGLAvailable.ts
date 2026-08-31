"use client";

import { useState } from "react";

export function useWebGLAvailable() {
  const [webGLAvailable] = useState<boolean | null>(() => {
    try {
      if (typeof document === "undefined") {
        return null;
      }

      const canvas = document.createElement("canvas");
      const context =
        canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl");

      return Boolean(context);
    } catch {
      return false;
    }
  });

  return webGLAvailable;
}
