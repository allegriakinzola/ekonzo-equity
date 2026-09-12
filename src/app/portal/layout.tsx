import { redirect } from "next/navigation";
import { getStaffSessionId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell/AppShell";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staffId = await getStaffSessionId();
  if (!staffId) redirect("/login");

  const staff = await prisma.staffUser.findUnique({ where: { id: staffId } });
  if (!staff) redirect("/login");

  return (
    <AppShell userName={staff.name} userEmail={staff.email}>
      {children}
    </AppShell>
  );
}
