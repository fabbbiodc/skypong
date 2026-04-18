import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormCardProps {
  children: ReactNode;
  className?: string;
}

export function FormCard({ children, className }: FormCardProps) {
  return <div className={cn("w-full max-w-md mx-auto", className)}>{children}</div>;
}
