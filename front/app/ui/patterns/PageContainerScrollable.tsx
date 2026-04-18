import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerScrollableProps {
  children: ReactNode;
  className?: string;
}

export function PageContainerScrollable({
  children,
  className,
}: PageContainerScrollableProps) {
  return (
    <div className={cn("page-content-container overflow-y-auto", className)}>
      {children}
    </div>
  );
}
