export type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  icon: "dashboard" | "customers";
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const PORTAL_NAV: NavSection[] = [
  {
    title: "Espace banque",
    items: [
      {
        href: "/portal",
        label: "Tableau de bord",
        icon: "dashboard",
        exact: true,
      },
      { href: "/portal/customers", label: "Clients", icon: "customers" },
    ],
  },
];

export function findNavLabel(pathname: string): string {
  let best = "Portail";
  let bestLen = -1;
  for (const section of PORTAL_NAV) {
    for (const item of section.items) {
      const match = item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (match && item.href.length > bestLen) {
        best = item.label;
        bestLen = item.href.length;
      }
    }
  }
  return best;
}
