"use client";

import { useRouter } from "next/navigation";
import { SignOutIcon } from "@phosphor-icons/react";

export function AccountLogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="eq-btn-ghost !px-3 !py-2"
      onClick={async () => {
        await fetch("/api/account/logout", { method: "POST" });
        router.push("/account/login");
        router.refresh();
      }}
    >
      <SignOutIcon className="size-4" />
      <span className="hidden sm:inline">Déconnexion</span>
    </button>
  );
}
