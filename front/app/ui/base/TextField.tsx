import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        filled:
          "bg-input-filled hover:bg-input-filled-hover focus:bg-input-filled-focus border border-transparent focus:border-primary rounded-md",
        outlined:
          "bg-transparent border border-border hover:border-border-hover focus:border-primary rounded-md",
        underlined:
          "bg-transparent border-0 border-b border-border hover:border-border-hover focus:border-primary rounded-none",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base md:text-lg",
        lg: "px-5 py-3 text-lg md:text-xl",
      },
      font: {
        display: "font-display",
        body: "font-sans",
        mono: "font-mono",
      },
      error: {
        true: "border-border-error focus:border-border-error focus:ring-red-500",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "filled",
        error: true,
        class: "bg-red-50",
      },
    ],
    defaultVariants: {
      variant: "filled",
      size: "md",
      font: "body",
      error: false,
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

interface TextFieldProps extends VariantProps<typeof inputVariants> {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "email" | "password" | "number";
  className?: string;
  disabled?: boolean;
  // React Hook Form support
  name?: string;
  register?: any;
  autoComplete?: string;
}

export function TextField({
  variant = "filled",
  size,
  font,
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
}: TextFieldProps) {
  const hasError = !!error;

  // Determine if using React Hook Form or controlled mode
  const isRHFMode = !!register && !!name;
  const registration = isRHFMode ? register(name) : {};

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className={labelVariants({ size })}>
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          inputVariants({
            variant,
            size,
            font,
            error: hasError,
            className,
          }),
        )}
        disabled={disabled}
        {...(isRHFMode
          ? registration
          : { value, onChange: (e) => onChange?.(e.target.value) })}
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
