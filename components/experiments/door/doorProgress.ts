import { DOOR_CHOREOGRAPHY } from "@/components/experiments/door/doorConfig";

export function getDoorTextureBlend(progress: number) {
  const frames = DOOR_CHOREOGRAPHY.sequence.frames;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  if (clampedProgress >= DOOR_CHOREOGRAPHY.sequence.holdFinalFrom) {
    return {
      currentIndex: frames.length - 1,
      currentFrame: frames[frames.length - 1],
      nextIndex: frames.length - 1,
      nextFrame: frames[frames.length - 1],
      mix: 0,
    };
  }

  for (let index = 0; index < frames.length - 1; index += 1) {
    const current = frames[index];
    const next = frames[index + 1];

    if (clampedProgress >= current.at && clampedProgress <= next.at) {
      const localProgress = (clampedProgress - current.at) / (next.at - current.at);

      return {
        currentIndex: index,
        currentFrame: current,
        nextIndex: index + 1,
        nextFrame: next,
        mix: smoothstep(0, 1, localProgress),
      };
    }
  }

  return {
    currentIndex: frames.length - 1,
    currentFrame: frames[frames.length - 1],
    nextIndex: frames.length - 1,
    nextFrame: frames[frames.length - 1],
    mix: 0,
  };
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);

  return x * x * (3 - 2 * x);
}
