"use client";

import Link from "next/link";
import {
  Sparkles,
  Inbox,
  Users,
  Frame,
  LayoutDashboard,
  CalendarRange,
} from "lucide-react";
import type { Persona } from "./app-shell";

interface NavItem {
  label: string;
  href: string;
  icon: typeof Sparkles;
  exact?: boolean;
}

function itemsFor(persona: Persona): NavItem[] {
  if (persona.kind === "rep") {
    return [
      { label: "Today", href: `/rep/${persona.repId}`, icon: Sparkles, exact: true },
      { label: "Inbox", href: `/rep/${persona.repId}/inbox`, icon: Inbox },
      { label: "Book", href: `/rep/${persona.repId}/collectors`, icon: Users },
      { label: "Inventory", href: `/artworks`, icon: Frame },
    ];
  }
  return [
    { label: "Pulse", href: `/`, icon: LayoutDashboard, exact: true },
    { label: "Collectors", href: `/collectors`, icon: Users },
    { label: "Inventory", href: `/artworks`, icon: Frame },
    { label: "Events", href: `/events`, icon: CalendarRange },
  ];
}

export function BottomNav({
  persona,
  pathname,
}: {
  persona: Persona;
  pathname: string;
}) {
  const items = itemsFor(persona);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-md md:hidden">
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
