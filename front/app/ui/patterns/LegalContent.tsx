import { cn } from "@/lib/utils";

interface LegalContentProps {
  html: string;
  className?: string;
}

export function LegalContent({ html, className }: LegalContentProps) {
  return (
    <div
      className={cn(
        "max-h-[55vh] overflow-y-auto rounded-lg bg-transparent p-4 text-sm leading-relaxed text-slate-300",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
