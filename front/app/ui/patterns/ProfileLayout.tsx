import { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const profileHeaderVariants = cva(
  "mb-6 flex flex-col items-center gap-4 border-b border-slate-700 pb-6 md:flex-row md:items-start",
  {
    variants: {
      align: {
        left: "md:justify-start",
        between: "md:justify-between",
      },
    },
    defaultVariants: {
      align: "left",
    },
  },
);

type ProfileHeaderAlign = VariantProps<typeof profileHeaderVariants>["align"];

interface ProfileSectionProps {
  children: ReactNode;
  className?: string;
}

export function ProfileSection({ children, className }: ProfileSectionProps) {
  return <section className={cn("space-y-4", className)}>{children}</section>;
}

interface ProfileHeaderProps extends ProfileSectionProps {
  align?: ProfileHeaderAlign;
}

export function ProfileHeader({
  children,
  align = "left",
  className,
}: ProfileHeaderProps) {
  return (
    <section className={cn(profileHeaderVariants({ align }), className)}>
      {children}
    </section>
  );
}

export function ProfileIdentity({ children, className }: ProfileSectionProps) {
  return <div className={cn("text-center md:text-left", className)}>{children}</div>;
}

export function ProfileStatsGrid({ children, className }: ProfileSectionProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ProfileTabsContainer({ children, className }: ProfileSectionProps) {
  return <div className={cn("mt-6 space-y-5", className)}>{children}</div>;
}

export function ProfileTabContent({ children, className }: ProfileSectionProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
