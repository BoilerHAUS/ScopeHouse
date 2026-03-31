import type { Route } from "next";

export const NAV_ITEMS: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Overview" },
  { href: "/projects", label: "Projects" },
  { href: "/projects/new", label: "New Project" },
];
