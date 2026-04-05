import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "transition-[transform,opacity,background-color,border-color,color]",
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
        outline:
          "border border-rule bg-transparent text-void hover:bg-paper hover:text-void",
        secondary: "",
        ghost: "",
        link: "h-auto rounded-none border-none bg-transparent px-0 py-0 text-signal-alt shadow-none hover:bg-transparent hover:text-signal hover:underline",
      },
      size: {
        default: "min-h-11 px-4 py-2.5 text-sm",
        xs: "min-h-7 px-2.5 py-1 text-xs",
        sm: "min-h-9 px-3.5 py-2 text-sm",
        lg: "min-h-12 px-6 py-3 text-base",
        icon: "size-11 p-0",
        "icon-xs": "size-7 p-0",
        "icon-sm": "size-9 p-0",
        "icon-lg": "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        "inline-flex items-center justify-center gap-2 border border-transparent bg-signal font-display text-paper uppercase tracking-[0.14em] shadow-[var(--shadow-sm)] outline-none transition-[transform,opacity,background-color,border-color,color] hover:-translate-y-px disabled:pointer-events-none disabled:opacity-60",
        variant === "ghost" && "bg-transparent text-void shadow-none hover:bg-white",
        variant === "secondary" &&
          "border-rule bg-secondary text-void hover:bg-white",
        variant === "destructive" &&
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        buttonVariants({ variant, size, className }),
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
