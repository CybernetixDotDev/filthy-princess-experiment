import Image from "next/image";
import Link from "next/link";

type RealmPlaceholderPageProps = {
  title: string;
  copy: string;
};

export function RealmPlaceholderPage({ title, copy }: RealmPlaceholderPageProps) {
  return (
    <main className="grid min-h-dvh place-items-center bg-black px-6 text-center text-white">
      <div className="flex w-full max-w-2xl flex-col items-center">
        <Image
          src="/FilthyPrincessLogo.png"
          alt="Filthy Princess"
          width={1536}
          height={1024}
          className="h-auto w-36 opacity-80 sm:w-44"
          priority
        />
        <h1 className="mt-8 font-mono text-xl uppercase tracking-[0.32em] text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-5 max-w-md text-sm leading-7 text-white/60 sm:text-base">
          {copy}
        </p>
        <Link
          href="/"
          className="mt-10 font-mono text-xs uppercase tracking-[0.28em] text-white/50 outline-none transition hover:text-white focus-visible:text-white focus-visible:ring-1 focus-visible:ring-white/70 focus-visible:ring-offset-8 focus-visible:ring-offset-black"
        >
          Return to the door
        </Link>
      </div>
    </main>
  );
}
