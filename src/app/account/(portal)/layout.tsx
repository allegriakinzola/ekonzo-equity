import { redirect } from "next/navigation";
import { getCustomerSessionId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { BrandLogo } from "@/components/BrandLogo";
import { AccountLogoutButton } from "./AccountLogoutButton";

export default async function AccountPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customerId = await getCustomerSessionId();
  if (!customerId) redirect("/account/login");

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer || !customer.isActive) redirect("/account/login");

  return (
    <div className="min-h-screen bg-[#f3f1ef]">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-3">
            <p className="hidden text-right text-xs sm:block">
              <span className="block font-semibold text-[var(--equity-black)]">
                {customer.fullName}
              </span>
              <span className="text-[var(--equity-gray)]">{customer.email}</span>
            </p>
            <AccountLogoutButton />
          </div>
        </div>
        <div className="equity-heritage-bar !flex !h-1 !w-full !rounded-none" />
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
