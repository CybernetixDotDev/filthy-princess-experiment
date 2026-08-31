import Link from "next/link";

import { AnimatedExperimentIndex } from "@/components/experiments/AnimatedExperimentIndex";

const experiments = [
  { href: "/experiments/door", label: "Door" },
  { href: "/experiments/fall", label: "Fall" },
  { href: "/experiments/descent", label: "Descent" },
];

export default function ExperimentsPage() {
  return (
    <main className="min-h-dvh bg-black px-6 py-10 text-white">
      <AnimatedExperimentIndex>
        <div className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-4xl flex-col justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-white/45">
              Visual R&D
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal sm:text-6xl">
              The Descent
            </h1>
          </div>

          <ul className="grid gap-px border-y border-white/15">
            {experiments.map((experiment) => (
              <li key={experiment.href}>
                <Link
                  href={experiment.href}
                  className="flex items-center justify-between py-5 font-mono text-sm uppercase tracking-[0.24em] text-white/70 transition hover:text-white"
                >
                  <span>{experiment.label}</span>
                  <span aria-hidden="true">/</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </AnimatedExperimentIndex>
    </main>
  );
}
