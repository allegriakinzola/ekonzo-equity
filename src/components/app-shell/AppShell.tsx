"use client";

import { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function AppShell({
  userName,
  userEmail,
  children,
}: {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-[280px]">
        <Navbar
          userName={userName}
          userEmail={userEmail}
          onMenuClick={() => setOpen(true)}
        />
        <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
