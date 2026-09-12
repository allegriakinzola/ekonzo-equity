"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HouseIcon, UsersThreeIcon, XIcon } from "@phosphor-icons/react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";
import { PORTAL_NAV, type NavItem } from "./nav";

const ICONS: Record<NavItem["icon"], React.ReactNode> = {
  dashboard: <HouseIcon className="size-5" weight="duotone" aria-hidden />,
  customers: <UsersThreeIcon className="size-5" weight="duotone" aria-hidden />,
};

function NavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--equity-red)] focus-visible:ring-offset-2",
        active
          ? "bg-[var(--equity-red)] text-white shadow-[0_8px_20px_-12px_rgba(166,38,38,0.8)]"
          : "text-[var(--equity-gray)] hover:bg-[var(--muted)] hover:text-[var(--equity-black)]",
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-lg transition",
          active
            ? "bg-white/15 text-white"
            : "bg-[var(--muted)] text-[var(--equity-red)] group-hover:bg-white",
        )}
      >
        {ICONS[item.icon]}
      </span>
      <span className="flex-1">{item.label}</span>
    </Link>
  );
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[var(--equity-black)]/45 backdrop-blur-[2px] transition lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-[var(--border)] bg-[var(--card)] transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Navigation principale"
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <BrandLogo size="sm" />
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--equity-gray)] transition hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--equity-red)] lg:hidden"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <XIcon className="size-5" />
          </button>
        </div>
        <div className="mx-5 h-1 overflow-hidden rounded-full bg-[var(--muted)]">
          <div className="h-full w-1/2 bg-[var(--equity-red)]" />
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
          {PORTAL_NAV.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--equity-gray-soft)]">
                {section.title}
              </p>
              <div className="space-y-1.5">
                {section.items.map((item) => (
                  <NavLink key={item.href} item={item} onNavigate={onClose} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] px-5 py-4">
          <p className="text-[11px] font-semibold text-[var(--equity-black)]">
            Equity BCDC
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--equity-gray)]">
            Portail opérations · titres publics
          </p>
        </div>
      </aside>
    </>
  );
}
