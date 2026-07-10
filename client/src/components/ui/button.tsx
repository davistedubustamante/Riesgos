import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-medium transition-all duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring)/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold hover:brightness-110 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.25)]",
        destructive:
          "bg-[hsl(var(--risk-critical))] text-white font-semibold hover:brightness-110 shadow-[0_0_0_3px_hsl(var(--risk-critical)/0.2)]",
        outline:
          "border border-[hsl(var(--border-hover))] text-[hsl(var(--text-secondary))] bg-transparent hover:bg-[var(--surface-panel)] hover:border-[hsl(var(--primary)/0.4)] hover:text-[hsl(var(--primary))]",
        ghost:
          "text-[hsl(var(--text-secondary))] hover:bg-[var(--surface-panel)] hover:text-[hsl(var(--text-primary))] border border-transparent hover:border-[hsl(var(--border))]",
        secondary:
          "bg-[var(--surface-overlay)] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] hover:bg-[var(--surface-overlay)] hover:border-[hsl(var(--border-hover))]",
        link:
          "text-[hsl(var(--primary))] underline-offset-4 hover:underline shadow-none",
        accent:
          "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] font-semibold hover:brightness-110 shadow-[0_0_0_3px_hsl(var(--accent)/0.2)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs rounded-[var(--radius)]",
        lg: "h-10 px-6 text-sm rounded-[var(--radius)]",
        icon: "h-9 w-9 rounded-[var(--radius)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean }>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
