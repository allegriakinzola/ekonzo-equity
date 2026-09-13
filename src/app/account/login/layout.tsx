import { redirect } from "next/navigation";
import { getCustomerSessionId } from "@/lib/session";

export default async function CustomerLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const id = await getCustomerSessionId();
  if (id) redirect("/account");
  return children;
}
