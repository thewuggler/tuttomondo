import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  collectors,
  daysSince,
  formatDays,
  formatMoney,
  getRep,
} from "@/lib/data";
import type { Collector } from "@/lib/data/types";

interface PageProps {
  params: Promise<{ rep: string }>;
}

export async function generateStaticParams() {
  const { reps } = await import("@/lib/data");
  return reps.map((r) => ({ rep: r.id }));
}

export default async function RepCollectorsPage({ params }: PageProps) {
  const { rep: repId } = await params;
  const rep = getRep(repId);
  if (!rep) notFound();

  const owned = collectors
    .filter((c) => c.owningRepId === repId)
    .sort((a, b) => b.lifetimeSpendCents - a.lifetimeSpendCents);

  const groups: Array<{ label: string; rows: Collector[] }> = [
    { label: "VIPs", rows: owned.filter((c) => c.tier === "vip") },
    { label: "Active", rows: owned.filter((c) => c.tier === "active") },
    { label: "Prospects", rows: owned.filter((c) => c.tier === "prospect") },
    { label: "Dormant", rows: owned.filter((c) => c.tier === "dormant") },
  ];

  return (
    <div className="space-y-6 px-4 py-5 md:px-0 md:py-0">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Book
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {owned.length} collectors
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatMoney(
            owned.reduce((acc, c) => acc + c.lifetimeSpendCents, 0),
          )}{" "}
          in lifetime relationships.
        </p>
      </header>

      <div className="space-y-6">
        {groups.map((g) =>
          g.rows.length === 0 ? null : (
            <section key={g.label}>
              <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {g.label} · {g.rows.length}
              </h2>
              <div className="mt-2 space-y-2">
                {g.rows.map((c) => (
                  <Link
                    key={c.id}
                    href={`/collectors/${c.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 transition hover:border-foreground/30 hover:shadow-sm"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-secondary text-xs font-medium">
                        {c.name
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{c.name}</p>
                        {c.tier === "vip" ? (
                          <Badge className="bg-foreground text-background text-[10px]">
                            VIP
                          </Badge>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.city} · last contact {formatDays(daysSince(c.lastContactAt))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium tabular-nums">
                        {formatMoney(c.lifetimeSpendCents)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">lifetime</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ),
        )}
      </div>
    </div>
  );
}
