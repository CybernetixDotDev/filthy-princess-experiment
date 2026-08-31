import Link from "next/link";

export default function Home() {
  return (
    <main className="grid min-h-dvh place-items-center bg-black px-6 text-white">
      <Link
        href="/experiments"
        className="font-mono text-sm uppercase tracking-[0.35em] text-white/70 transition hover:text-white"
      >
        The Descent experiments
      </Link>
    </main>
  );
}
