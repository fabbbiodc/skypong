import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  // Base styles - circular avatar with consistent styling
  "inline-flex items-center justify-center rounded-full overflow-hidden bg-primary text-white font-bold uppercase select-none",
  {
    variants: {
      size: {
        sm: "w-8 h-8 text-sm", // 32px - small contexts
        md: "w-12 h-12 text-lg", // 48px - navigation (default)
        lg: "w-16 h-16 text-2xl", // 64px - profile pages
      },
      clickable: {
        true: "cursor-pointer hover:opacity-80 transition-opacity duration-200",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      clickable: false,
    },
  },
);

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  /** URL to the user's avatar image */
  src?: string;
  /** Alt text for the avatar image */
  alt?: string;
  /** User's nickname - used to generate initials fallback (first letter) */
  fallbackText?: string;
  /** Additional CSS classes */
  className?: string;
  /** Click handler - makes avatar clickable */
  onClick?: () => void;
}

export function Avatar({
  src,
  alt = "User avatar",
  fallbackText,
  size,
  className,
  onClick,
}: AvatarProps) {
  const avatarClass = cn(
    avatarVariants({
      size,
      clickable: !!onClick,
      className,
    }),
  );

  // Generate first letter of nickname for fallback
  const initial = fallbackText ? fallbackText.charAt(0).toUpperCase() : "?";

  return (
    <div
      className={avatarClass}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it and show fallback
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span className="flex items-center justify-center w-full h-full">
          {initial}
        </span>
      )}
    </div>
  );
}
