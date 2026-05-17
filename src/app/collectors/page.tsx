import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  collectors,
  daysSince,
  formatDays,
  formatMoney,
  getRep,
} from "@/lib/data";
import type { Collector } from "@/lib/data/types";

export default function CollectorsIndexPage() {
  const groups: Array<{ label: string; rows: Collector[] }> = [
    { label: "VIPs", rows: collectors.filter((c) => c.tier === "vip").sort(byLifetime) },
    { label: "Active", rows: collectors.filter((c) => c.tier === "active").sort(byLifetime) },
    { label: "Prospects", rows: collectors.filter((c) => c.tier === "prospect").sort(byLifetime) },
    { label: "Dormant", rows: collectors.filter((c) => c.tier === "dormant").sort(byLifetime) },
  ];

  const total = collectors.reduce((acc, c) => acc + c.lifetimeSpendCents, 0);

  return (
    <div className="space-y-6 px-4 py-6 md:px-0 md:py-0">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Collectors
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {collectors.length} relationships
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatMoney(total)} across the gallery's book.
        </p>
      </header>

      <div className="space-y-6">
        {groups.map((g) =>
          g.rows.length === 0 ? null : (
            <section key={g.label}>
              <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {g.label} · {g.rows.length}
              </h2>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {g.rows.map((c) => {
                  const rep = getRep(c.owningRepId);
                  return (
                    <Link
                      key={c.id}
                      href={`/collectors/${c.id}`}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 transition hover:border-foreground/30 hover:shadow-sm"
                    >
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-secondary text-xs font-medium">
                          {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{c.name}</p>
                          {c.tier === "vip" ? (
                            <Badge className="bg-foreground text-background text-[10px]">VIP</Badge>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.city} · {rep?.name.split(" ")[0]} · {formatDays(daysSince(c.lastContactAt))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium tabular-nums">
                          {formatMoney(c.lifetimeSpendCents)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ),
        )}
      </div>
    </div>
  );
}

function byLifetime(a: Collector, b: Collector) {
  return b.lifetimeSpendCents - a.lifetimeSpendCents;
}
