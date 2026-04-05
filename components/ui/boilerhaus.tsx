import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "active" | "warning" | "danger" | "success";

const badgeVariants: Record<BadgeVariant, string> = {
  neutral: "border-rule bg-white text-smoke",
  active: "border-signal-alt bg-signal-alt text-paper",
  warning: "border-caution bg-caution text-paper",
  danger: "border-signal bg-signal text-paper",
  success: "border-growth bg-growth text-paper",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  className,
  variant = "neutral",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 font-display text-xs tracking-[0.14em] uppercase",
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("border bg-surface", className)} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex", className)} {...props} />;
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex", className)} {...props} />;
}

export function PageShell({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-h-screen", className)} {...props} />;
}

export function PageShellTopbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return <header className={cn(className)} {...props} />;
}

export function PageShellBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-h-[calc(100vh-var(--topbar-height))]", className)} {...props} />;
}

export function PageShellSidebar({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return <aside className={cn(className)} {...props} />;
}

export function PageShellContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("flex-1", className)} {...props} />;
}

type PageShellNavItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  icon?: React.ReactNode;
  asChild?: boolean;
};

export function PageShellNavItem({
  active = false,
  icon,
  asChild = false,
  className,
  children,
  ...props
}: PageShellNavItemProps) {
  const itemClassName = cn(
    "flex w-full items-start gap-3 border-l-2 px-3 py-3 text-left transition",
    active
      ? "border-signal bg-white/8 text-white"
      : "border-white/10 text-white/72 hover:border-white/40 hover:bg-white/5 hover:text-white",
    className,
  );
  const content = (
    <>
      {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
      <span className="min-w-0 flex-1">{children}</span>
    </>
  );

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
      "aria-current"?: "page";
    }>;
    const childProps = children.props as {
      className?: string;
      children?: React.ReactNode;
      "aria-current"?: "page";
    };

    return React.cloneElement(
      child,
      {
        className: cn(itemClassName, childProps.className),
        "aria-current": active ? "page" : undefined,
      },
      <>
        {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
        <span className="min-w-0 flex-1">{childProps.children}</span>
      </>,
    );
  }

  return (
    <button
      className={itemClassName}
      {...props}
    >
      {content}
    </button>
  );
}

type StatProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string | number;
  label: string;
  delta?: string | number;
  deltaDirection?: "up" | "down" | "neutral";
  caption?: string;
};

export function Stat({
  className,
  value,
  label,
  delta,
  deltaDirection = "neutral",
  caption,
  ...props
}: StatProps) {
  const deltaClass =
    deltaDirection === "up"
      ? "text-growth"
      : deltaDirection === "down"
        ? "text-signal"
        : "text-smoke";

  return (
    <div className={cn("px-4 py-4", className)} {...props}>
      <p className="font-mono text-xs tracking-[0.24em] text-smoke uppercase">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-display text-3xl leading-none tracking-[0.08em] uppercase text-void">
          {value}
        </p>
        {delta !== undefined ? (
          <p className={cn("text-xs font-medium", deltaClass)}>{delta}</p>
        ) : null}
      </div>
      {caption ? <p className="mt-3 text-sm leading-6 text-smoke">{caption}</p> : null}
    </div>
  );
}
