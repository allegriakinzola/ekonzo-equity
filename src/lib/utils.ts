import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAmount(amount: number, currency: string) {
  return `${Math.round(amount).toLocaleString("fr-CD")} ${currency}`;
}
