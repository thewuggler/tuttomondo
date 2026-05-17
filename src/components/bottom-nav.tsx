"use client";

import Link from "next/link";
import { Sparkles, Inbox, Users, Frame } from "lucide-react";

export function BottomNav({ repId, pathname }: { repId: string; pathname: string }) {
  const items = [
    { label: "Today", href: `/rep/${repId}`, icon: Sparkles, exact: true },
    { label: "Inbox", href: `/rep/${repId}/inbox`, icon: Inbox },
    { label: "Collectors", href: `/rep/${repId}/collectors`, icon: Users },
    { label: "Inventory", href: `/artworks`, icon: Frame },
  ];

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
