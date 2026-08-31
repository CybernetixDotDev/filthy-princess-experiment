import type { ReactNode } from "react";

type ExperimentShellProps = {
  children: ReactNode;
  label?: string;
};

export function ExperimentShell({ children, label }: ExperimentShellProps) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-white">
      {children}
      {label ? (
        <div className="pointer-events-none absolute left-5 top-5 z-10 font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
          {label}
        </div>
      ) : null}
    </main>
  );
}
