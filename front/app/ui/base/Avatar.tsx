import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "inline-flex items-center justify-center rounded-full overflow-hidden bg-primary text-white font-bold uppercase select-none transition-all duration-200",
  {
    variants: {
      size: {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-14 h-14 text-lg",
        xl: "w-16 h-16 text-2xl",
      },
      variant: {
        default: "bg-primary text-white",
        secondary: "bg-secondary text-white",
        danger: "bg-danger text-white",
      },
      state: {
        default: "",
        clickable: "cursor-pointer hover:opacity-80",
        offline: "opacity-50",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      state: "default",
    },
  },
);

type AvatarSize = VariantProps<typeof avatarVariants>["size"];
type AvatarVariant = VariantProps<typeof avatarVariants>["variant"];
type AvatarState = VariantProps<typeof avatarVariants>["state"];

interface AvatarProps {
  /** URL to the user's avatar image */
  src?: string;
  /** Alt text for the avatar image */
  alt?: string;
  /** User's nickname - used to generate initials fallback */
  fallbackText?: string;
  /** Additional CSS classes */
  className?: string;
  /** Click handler - makes avatar clickable */
  onClick?: () => void;
  /** Avatar size */
  size?: AvatarSize;
  /** Color variant */
  variant?: AvatarVariant;
  /** State variant */
  state?: AvatarState;
}

export function Avatar({
  src,
  alt = "User avatar",
  fallbackText,
  size = "md",
  variant = "default",
  state: propState,
  className,
  onClick,
}: AvatarProps) {
  const state: AvatarState = onClick ? "clickable" : (propState ?? "default");

  const initial = fallbackText ? fallbackText.charAt(0).toUpperCase() : "?";

  return (
    <div
      className={cn(avatarVariants({ size, variant, state }), className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
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
