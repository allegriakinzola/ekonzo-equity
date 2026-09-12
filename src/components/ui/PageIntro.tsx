import { cn } from "@/lib/utils";

/** En-tête de page — modèle login (eyebrow / titre / lead). */
export function PageIntro({
  eyebrow,
  title,
  description,
  className,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <header
      className={cn(
        "eq-reveal space-y-2",
        align === "center" && "text-center",
        className,
      )}
    >
      <p className="eq-eyebrow">{eyebrow}</p>
      <h1 className="eq-title">{title}</h1>
      {description ? <p className="eq-lead">{description}</p> : null}
    </header>
  );
}
