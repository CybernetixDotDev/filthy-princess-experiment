"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "@/lib/animation/motion";

type SecretInviteExperienceProps = {
  active: boolean;
};

export function SecretInviteExperience({ active }: SecretInviteExperienceProps) {
  const reducedMotion = useReducedMotion();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasReadAgain, setHasReadAgain] = useState(false);
  const guestButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalWasOpenRef = useRef(false);

  useEffect(() => {
    if (!isModalOpen) {
      if (modalWasOpenRef.current) guestButtonRef.current?.focus();
      return;
    }

    modalWasOpenRef.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  function closeModal() {
    setIsModalOpen(false);
  }

  function readOfferAgain() {
    setHasReadAgain(true);
    closeModal();
  }

  return (
    <motion.main
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.85, ease: "easeOut" }}
      className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-[#080607] px-6 py-16 text-[#f3e6df]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_58%_42%,rgba(177,91,111,0.2),transparent_32%),radial-gradient(circle_at_70%_100%,rgba(174,112,68,0.16),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(0,0,0,0.58),transparent)]" />
      <div className="pointer-events-none absolute -right-12 bottom-[-8%] hidden w-[min(42vw,560px)] opacity-[0.16] blur-[0.2px] sm:block">
        <Image src="/secretInvite.png" alt="" width={1145} height={1374} className="h-auto w-full" />
      </div>

      <section className="relative z-10 w-full max-w-xl text-center">
        {active ? (
          <ActiveInviteCopy
            hasReadAgain={hasReadAgain}
            guestButtonRef={guestButtonRef}
            onOpenModal={() => setIsModalOpen(true)}
          />
        ) : (
          <InactiveInviteCopy />
        )}
      </section>
      {active && isModalOpen ? (
        <InviteConfirmationModal
          reducedMotion={Boolean(reducedMotion)}
          modalRef={modalRef}
          onClose={closeModal}
          onReadAgain={readOfferAgain}
        />
      ) : null}
    </motion.main>
  );
}

type ActiveInviteCopyProps = {
  hasReadAgain: boolean;
  guestButtonRef: React.RefObject<HTMLButtonElement | null>;
  onOpenModal: () => void;
};

function ActiveInviteCopy({ hasReadAgain, guestButtonRef, onOpenModal }: ActiveInviteCopyProps) {
  if (hasReadAgain) {
    return (
      <>
        <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#d6a28d]/75">
          A private invitation
        </p>
        <h1 className="mt-7 font-serif text-5xl leading-[0.95] text-[#f6e7df] sm:text-7xl">
          You really want
          <br />
          <span className="text-[#df9b9e]">to walk away?</span>
        </h1>
        <div className="mx-auto mt-8 max-w-md space-y-5 text-sm leading-7 text-[#e7d5cf]/75 sm:text-base">
          <p>You found something most people will miss.</p>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#f0d7ce]">
            No application. No questions. No waiting.
          </p>
          <p>And right now, the door is open.</p>
          <p className="italic text-[#e7c2bd]/80">You don&apos;t want to miss this chance.</p>
        </div>
        <InviteActions guestButtonRef={guestButtonRef} onOpenModal={onOpenModal} />
      </>
    );
  }

  return (
    <>
      <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#d6a28d]/75">
        A private invitation
      </p>
      <h1 className="mt-7 font-serif text-5xl leading-[0.95] text-[#f6e7df] sm:text-7xl">
        Well, well...
        <br />
        <span className="text-[#df9b9e]">You found it.</span>
      </h1>
      <div className="mx-auto mt-8 max-w-md space-y-5 text-sm leading-7 text-[#e7d5cf]/75 sm:text-base">
        <p>The proverbial key under the doormat.</p>
        <p>
          Usually, getting into my Inner Sanctum takes a little more than curiosity.
          But you happened to find this while I left the door unlocked.
        </p>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#f0d7ce]">
          No application. No questions. No waiting.
        </p>
        <p className="italic text-[#e7c2bd]/80">
          Your chance to get into my... well, I suppose that depends on what you do next.
        </p>
      </div>
      <InviteActions guestButtonRef={guestButtonRef} onOpenModal={onOpenModal} />
      <p className="mt-12 text-xs text-[#d9bbb2]/45">This invitation won&apos;t always be here.</p>
    </>
  );
}

function InviteActions({
  guestButtonRef,
  onOpenModal,
}: Pick<ActiveInviteCopyProps, "guestButtonRef" | "onOpenModal">) {
  return (
    <div className="mt-11 flex flex-col items-center gap-6">
      <Link
        href="/inner-sanctum"
        className="border border-[#d49a87]/65 bg-[#8e4d5c]/20 px-7 py-4 font-mono text-xs uppercase tracking-[0.2em] text-[#f7e7df] transition hover:border-[#f0c0aa] hover:bg-[#a75f6f]/35 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f0c0aa] focus-visible:ring-offset-4 focus-visible:ring-offset-[#080607]"
      >
        Enter the Inner Sanctum
      </Link>
      <button
        ref={guestButtonRef}
        type="button"
        onClick={onOpenModal}
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d9c0ba]/55 transition hover:text-[#f5e5df] focus-visible:text-[#f5e5df] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f0c0aa] focus-visible:ring-offset-4 focus-visible:ring-offset-[#080607]"
      >
        No thanks - I&apos;ll continue as a guest
      </button>
    </div>
  );
}

type InviteConfirmationModalProps = {
  reducedMotion: boolean;
  modalRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onReadAgain: () => void;
};

function InviteConfirmationModal({
  reducedMotion,
  modalRef,
  onClose,
  onReadAgain,
}: InviteConfirmationModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/65 px-5 py-8 backdrop-blur-md"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-confirmation-title"
        tabIndex={-1}
        className="relative w-full max-w-md overflow-hidden border border-[#d79a9d]/45 bg-[#120d11]/90 px-6 py-9 text-center shadow-[0_0_70px_rgba(194,105,128,0.16)] outline-none sm:px-10"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(205,125,143,0.16),transparent_58%)]" />
        <div className="relative">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#d6a28d]/65">
            A second thought
          </p>
          <h2 id="invite-confirmation-title" className="mt-5 font-serif text-4xl text-[#f6e7df]">
            Are you sure?
          </h2>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-[#e7d5cf]/75 sm:text-base">
            You can continue to the standard signup...
            <br />
            but this little door won&apos;t always be open.
          </p>
          <div className="mt-8 flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={onReadAgain}
              className="border border-[#d49a87]/65 bg-[#8e4d5c]/20 px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#f7e7df] transition hover:border-[#f0c0aa] hover:bg-[#a75f6f]/35 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f0c0aa] focus-visible:ring-offset-4 focus-visible:ring-offset-[#120d11]"
            >
              Read my offer again
            </button>
            <Link
              href="/access"
              onClick={onClose}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d9c0ba]/60 transition hover:text-[#f5e5df] focus-visible:text-[#f5e5df] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f0c0aa] focus-visible:ring-offset-4 focus-visible:ring-offset-[#120d11]"
            >
              Continue
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InactiveInviteCopy() {
  return (
    <>
      <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#d6a28d]/65">A quiet place</p>
      <h1 className="mt-7 font-serif text-5xl leading-[0.95] text-[#f6e7df] sm:text-7xl">
        Oh...
        <br />
        <span className="text-[#df9b9e]">You found the hiding place.</span>
      </h1>
      <p className="mx-auto mt-8 max-w-sm text-sm leading-7 text-[#e7d5cf]/70 sm:text-base">
        But the door isn&apos;t open right now.
        <br />
        Princess locked it again.
      </p>
      <Link
        href="/access"
        className="mt-11 inline-block font-mono text-xs uppercase tracking-[0.22em] text-[#e0beb6]/65 transition hover:text-[#f5e5df] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f0c0aa] focus-visible:ring-offset-4 focus-visible:ring-offset-[#080607]"
      >
        Continue as a guest
      </Link>
    </>
  );
}
