import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        filled:
          "bg-[var(--color-input-filled)] hover:bg-[var(--color-input-filled-hover)] focus:bg-[var(--color-input-filled-focus)] border border-transparent focus:border-primary rounded-lg",
        outlined:
          "bg-transparent border border-border hover:border-border-hover focus:border-primary rounded-lg",
        underlined:
          "bg-transparent border-0 border-b border-border hover:border-border-hover focus:border-primary rounded-none",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-5 py-3 text-lg",
      },
      state: {
        default: "",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500",
        disabled: "opacity-50 cursor-not-allowed",
      },
    },
    compoundVariants: [],
    defaultVariants: {
      variant: "filled",
      size: "md",
      state: "default",
    },
  },
);

const labelVariants = cva("block font-medium text-gray-700 mb-1", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type InputVariant = VariantProps<typeof inputVariants>["variant"];
type InputSize = VariantProps<typeof inputVariants>["size"];
type InputState = VariantProps<typeof inputVariants>["state"];

interface TextFieldProps {
  variant?: InputVariant;
  size?: InputSize;
  state?: InputState;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  className?: string;
  disabled?: boolean;
  name?: string;
  register?: any;
  autoComplete?: string;
  required?: boolean;
  id?: string;
}

export function TextField({
  variant = "filled",
  size = "md",
  state: propState,
  label,
  placeholder,
  error,
  helperText,
  value,
  onChange,
  type = "text",
  className,
  disabled = false,
  name,
  register,
  autoComplete,
  required = false,
  id,
}: TextFieldProps) {
  const hasError = !!error;
  const state: InputState = hasError ? "error" : (propState ?? "default");

  const isRHFMode = !!register && !!name;
  const registration = isRHFMode && name ? register(name) : {};
  const inputId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={labelVariants({ size })}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={cn(
          inputVariants({
            variant,
            size,
            state: hasError ? "error" : "default",
          }),
          className,
        )}
        disabled={disabled}
        {...(isRHFMode
          ? registration
          : {
              value,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                onChange?.(e.target.value),
            })}
      />
      {(error || helperText) && (
        <p
          className={cn(
            "mt-1 text-sm",
            error ? "text-red-600" : "text-gray-500",
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
