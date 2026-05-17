import Link from "next/link";
import { ArrowUpRight, AlertTriangle, Sparkles, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  collectors,
  events,
  formatDays,
  formatMoney,
  gallery,
  getAttentionList,
  getCollector,
  getRepHealth,
  reps,
  threads,
  daysSince,
  purchases,
  getArtwork,
} from "@/lib/data";

export default function OwnerDashboardPage() {
  const salesReps = reps.filter((r) => r.role === "rep" || r.role === "director");
  const repsWithHealth = salesReps.map((r) => ({
    rep: r,
    health: getRepHealth(r.id),
  }));

  const attention = getAttentionList();
  const galleryNeedsReply = threads.filter((t) => t.status === "needs-reply").length;
  const openDeals = threads.filter((t) => t.aiFlag === "deal-momentum").length;
  const totalCollectors = collectors.length;
  const ytdRevenueCents = purchases
    .filter((p) => new Date(p.date).getFullYear() >= 2024)
    .reduce((acc, p) => acc + p.priceCents, 0);

  return (
    <div className="space-y-6 px-4 py-6 md:px-0 md:py-0">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {gallery.name}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Gallery Pulse
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Where the relationships stand today. Surfacing what needs you, before it becomes the kind of silence a collector remembers.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active collectors" value={totalCollectors.toString()} hint="across 4 reps" />
        <StatCard label="Threads needing reply" value={galleryNeedsReply.toString()} hint="surface in detail below" tone={galleryNeedsReply > 4 ? "warn" : "ok"} />
        <StatCard label="Open deals with momentum" value={openDeals.toString()} hint="don't lose these to silence" tone="momentum" />
        <StatCard label="Revenue, last 24 mo." value={formatMoney(ytdRevenueCents)} hint="across all reps" />
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight">Reps</h2>
          <p className="text-xs text-muted-foreground">
            Click a rep to drill into their book.
          </p>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {repsWithHealth.map(({ rep, health }) => (
            <Link
              key={rep.id}
              href={`/rep/${rep.id}`}
              className="group block"
            >
              <Card className="transition group-hover:border-foreground/40 group-hover:shadow-sm">
                <CardHeader className="flex flex-row items-start gap-3 pb-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-secondary text-sm font-medium">
                      {rep.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base">{rep.name}</CardTitle>
                    <CardDescription>{rep.title}</CardDescription>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <Metric label="Collectors" value={health.collectorsOwned.toString()} />
                    <Metric
                      label="Needs reply"
                      value={health.needsReplyCount.toString()}
                      tone={health.needsReplyCount >= 2 ? "warn" : "ok"}
                    />
                    <Metric
                      label="Stale VIPs"
                      value={health.staleVipCount.toString()}
                      tone={health.staleVipCount > 0 ? "warn" : "ok"}
                    />
                  </div>
                  <Separator />
                  <RepMomentumBar value={health.thirtyDayMomentum} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <AlertTriangle className="size-4 text-amber-600" />
            <CardTitle className="text-base">Needs attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            <ul className="divide-y divide-border/60">
              {attention.map((a) => (
                <li key={a.collector.id}>
                  <Link
                    href={`/collectors/${a.collector.id}`}
                    className="block px-6 py-3.5 transition hover:bg-accent/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{a.collector.name}</span>
                          <Badge variant="outline" className="capitalize text-[10px]">
                            {a.collector.tier}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            · {a.rep.name.split(" ")[0]}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground leading-snug">
                          {a.reason}
                        </p>
                      </div>
                      <SeverityDot severity={a.severity} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Sparkles className="size-4 text-foreground" />
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border/60">
              {recentActivity().map((entry, i) => (
                <li key={i} className="px-6 py-3.5">
                  <p className="text-sm">{entry.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {entry.detail} · {entry.timeAgo}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight">Upcoming</h2>
          <p className="text-xs text-muted-foreground">Events & fairs</p>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {events.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {e.kind.replace("-", " ")}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold leading-tight">
                  {e.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(e.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {e.city}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <TrendingUp className="size-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {e.attendeeCollectorIds.length} collectors flagged
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "ok" | "warn" | "momentum";
}) {
  const tones: Record<string, string> = {
    default: "",
    ok: "",
    warn: "border-amber-300/70",
    momentum: "border-emerald-300/70",
  };
  return (
    <Card className={tones[tone]}>
      <CardContent className="space-y-1 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="font-display text-3xl font-semibold tracking-tight">
          {value}
        </p>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-0.5 font-medium tabular-nums ${
          tone === "warn" ? "text-amber-700" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function RepMomentumBar({ value }: { value: number }) {
  const width = Math.min(100, Math.max(8, value * 3.3));
  const tone =
    value >= 20
      ? "bg-emerald-500"
      : value >= 10
      ? "bg-amber-400"
      : "bg-rose-400";
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>30-day momentum</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full ${tone}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function SeverityDot({ severity }: { severity: "high" | "medium" | "low" }) {
  const tones: Record<string, string> = {
    high: "bg-rose-500",
    medium: "bg-amber-500",
    low: "bg-muted-foreground/40",
  };
  return (
    <span className={`mt-1 inline-block size-2 shrink-0 rounded-full ${tones[severity]}`} />
  );
}

function recentActivity() {
  const items: Array<{ title: string; detail: string; timeAgo: string }> = [];
  for (const p of purchases.slice(0, 4)) {
    const c = getCollector(p.collectorId);
    const a = getArtwork(p.artworkId);
    if (!c || !a) continue;
    items.push({
      title: `${c.name} acquired ${a.title}`,
      detail: `${formatMoney(p.priceCents)} · via ${
        reps.find((r) => r.id === p.repId)?.name.split(" ")[0]
      }`,
      timeAgo: formatDays(daysSince(p.date)),
    });
  }
  return items;
}
