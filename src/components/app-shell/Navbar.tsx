"use client";

import { usePathname, useRouter } from "next/navigation";
import { ListIcon, SignOutIcon } from "@phosphor-icons/react";
import { findNavLabel } from "./nav";

export function Navbar({
  userName,
  userEmail,
  onMenuClick,
}: {
  userName: string;
  userEmail: string;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const title = findNavLabel(pathname);
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/90 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
        <button
          type="button"
          className="rounded-xl p-2.5 text-[var(--equity-gray)] transition hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--equity-red)] lg:hidden"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
        >
          <ListIcon className="size-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="eq-eyebrow !normal-case !tracking-normal truncate text-[11px]">
            Equity BCDC
          </p>
          <p className="truncate text-base font-extrabold tracking-tight text-[var(--equity-black)]">
            {title}
          </p>
        </div>

        <div className="hidden items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1.5 sm:flex">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--equity-red)] text-xs font-bold text-white"
            aria-hidden
          >
            {initials || "EQ"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--equity-black)]">
              {userName}
            </p>
            <p className="truncate text-[11px] text-[var(--equity-gray)]">
              {userEmail}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="eq-btn-ghost"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
          }}
        >
          <SignOutIcon className="size-4" aria-hidden />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
