import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-store-primary text-white font-medium hover:bg-store-primary-dark focus:ring-2 focus:ring-store-primary/50",
        destructive: "bg-store-error text-white font-medium hover:bg-store-error-dark focus:ring-2 focus:ring-store-error/50",
        outline: "border-2 border-store-primary text-store-primary bg-white font-medium hover:bg-store-primary hover:text-white focus:ring-2 focus:ring-store-primary/50",
        secondary: "bg-gray-200 text-gray-900 font-medium hover:bg-gray-300 focus:ring-2 focus:ring-gray-400/50",
        ghost: "text-gray-700 font-medium hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-400/50",
        link: "text-store-primary font-medium underline-offset-4 hover:underline focus:ring-2 focus:ring-store-primary/50",
        gradient: "bg-gradient-to-r from-store-primary to-store-secondary text-white font-medium hover:from-store-primary-dark hover:to-store-secondary-dark focus:ring-2 focus:ring-store-primary/50",
        success: "bg-store-success text-white font-medium hover:bg-store-success-dark focus:ring-2 focus:ring-store-success/50",
        warning: "bg-store-warning text-white font-medium hover:bg-store-warning-dark focus:ring-2 focus:ring-store-warning/50",
        error: "bg-store-error text-white font-medium hover:bg-store-error-dark focus:ring-2 focus:ring-store-error/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            {children}
          </div>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
