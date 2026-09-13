import { listCustomers } from "@/modules/payment.service";
import { PageIntro } from "@/components/ui/PageIntro";
import { CustomersManager } from "./CustomersManager";

export default async function CustomersPage() {
  const customers = await listCustomers();
  const rows = customers.map((c) => ({
    ...c,
    balance: Number(c.balance),
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Internet banking"
        title="Clients"
        description="Ouvrez un compte via e-mail, OTP et pièce d'identité, ou supprimez un client existant."
      />
      <CustomersManager initial={rows} />
    </div>
  );
}
