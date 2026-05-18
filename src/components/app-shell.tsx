"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PersonaSwitcher } from "./persona-switcher";
import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";
import { BrandMark } from "./brand-mark";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const persona = derivePersona(pathname);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 md:h-16 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
            <BrandMark className="size-5 text-foreground" />
            Tuttomondo
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <PersonaSwitcher pathname={pathname} />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0 md:gap-8 md:px-8 md:py-6">
        <Sidebar persona={persona} />
        <main className="flex-1 pb-20 md:pb-6">{children}</main>
      </div>

      <BottomNav persona={persona} pathname={pathname} />
    </div>
  );
}

export type Persona =
  | { kind: "owner" }
  | { kind: "rep"; repId: string };

export function derivePersona(pathname: string): Persona {
  if (pathname.startsWith("/rep/")) {
    const repId = pathname.split("/")[2];
    if (repId) return { kind: "rep", repId };
  }
  return { kind: "owner" };
}
