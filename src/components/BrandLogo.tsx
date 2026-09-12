import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Large mark for auth / marketing screens */
  size?: "sm" | "md" | "lg";
  priority?: boolean;
};

const SIZES = {
  sm: { width: 140, height: 48 },
  md: { width: 200, height: 68 },
  lg: { width: 260, height: 88 },
} as const;

export function BrandLogo({ className, size = "md", priority }: Props) {
  const dim = SIZES[size];
  return (
    <Image
      src="/equitylogo.png"
      alt="Equity BCDC"
      width={dim.width}
      height={dim.height}
      priority={priority}
      className={cn("h-auto w-auto object-contain object-left", className)}
      style={{ maxHeight: dim.height }}
    />
  );
}
