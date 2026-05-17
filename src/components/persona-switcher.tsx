"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { reps } from "@/lib/data";
import { derivePersona } from "./app-shell";

const repPersonas = ["u_jordan", "u_sarah", "u_marcus", "u_priya"];

export function PersonaSwitcher({ pathname }: { pathname: string }) {
  const persona = derivePersona(pathname);
  const repsById = Object.fromEntries(reps.map((r) => [r.id, r]));

  const label =
    persona.kind === "owner"
      ? "David Rosen — Owner"
      : `${repsById[persona.repId]?.name ?? "Rep"} — ${repsById[persona.repId]?.role === "director" ? "Director" : "Sales"}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2 font-medium">
            <span className="hidden sm:inline">Viewing as</span>
            <span className="font-semibold">{label}</span>
            <ChevronDown className="size-4 opacity-60" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Switch persona</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link href="/owner" className="flex flex-col items-start">
              <span className="font-medium">David Rosen</span>
              <span className="text-xs text-muted-foreground">Owner — full gallery view</span>
            </Link>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">Sales personas</DropdownMenuLabel>
        {repPersonas.map((repId) => {
          const r = repsById[repId];
          if (!r) return null;
          return (
            <DropdownMenuItem
              key={repId}
              render={
                <Link href={`/rep/${repId}`} className="flex flex-col items-start">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{r.title}</span>
                </Link>
              }
            />
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
