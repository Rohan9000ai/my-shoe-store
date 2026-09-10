import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", isLoading = false, className = "", children, disabled, ...props },
    ref
  ) => {
    const base =
      "w-full rounded-md px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60";

    const variants: Record<string, string> = {
      primary: "bg-gold text-espresso hover:bg-gold/90",
      secondary: "bg-brown text-beige hover:bg-espresso",
      outline: "border border-brown text-brown hover:bg-brown/10",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${base} ${variants[variant]} ${className}`}
        {...props}
      >
        {isLoading ? "Please wait..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;