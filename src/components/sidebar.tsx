"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Inbox,
  Frame,
  CalendarRange,
  Sparkles,
} from "lucide-react";
import type { Persona } from "./app-shell";

const ownerNav = [
  { label: "Dashboard", href: "/owner", icon: LayoutDashboard },
  { label: "Reps", href: "/owner/reps", icon: Users },
  { label: "Collectors", href: "/collectors", icon: Users },
  { label: "Inventory", href: "/artworks", icon: Frame },
  { label: "Events", href: "/events", icon: CalendarRange },
];

const repNav = (repId: string) => [
  { label: "Today", href: `/rep/${repId}`, icon: Sparkles },
  { label: "Inbox", href: `/rep/${repId}/inbox`, icon: Inbox },
  { label: "Collectors", href: `/rep/${repId}/collectors`, icon: Users },
  { label: "Inventory", href: `/artworks`, icon: Frame },
];

export function Sidebar({ persona }: { persona: Persona }) {
  const pathname = usePathname();
  const nav = persona.kind === "owner" ? ownerNav : repNav(persona.repId);

  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <nav className="sticky top-24 flex flex-col gap-0.5">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/owner" && item.href !== `/rep/${persona.kind === "rep" ? persona.repId : ""}` && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
