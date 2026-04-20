"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { InteractiveMarbleBall } from "./InteractiveMarbleBall";
import { useTranslation } from "@/hooks/use-translation";

const ballCTAVariants = cva("flex flex-col items-center gap-2", {
  variants: {
    size: {
      sm: "gap-1",
      md: "gap-2",
      lg: "gap-2",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type BallCTASize = VariantProps<typeof ballCTAVariants>["size"];

export interface BallCTAProps {
  size?: BallCTASize;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function BallCTA({
  size = "md",
  className,
  onClick,
  disabled = false,
}: BallCTAProps) {
  const { t } = useTranslation();
  const label = (t as unknown as { game?: { clickToPlay?: string } })?.game?.clickToPlay ?? "Click to play";

  return (
    <div className={cn(ballCTAVariants({ size }), className)}>
      <InteractiveMarbleBall size={size} onClick={onClick} disabled={disabled} />
      <span className="text-sm font-medium text-slate-300 opacity-80">{label}</span>
    </div>
  );
}