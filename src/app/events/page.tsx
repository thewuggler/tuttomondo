import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Sparkles, ArrowUpRight } from "lucide-react";
import { events, getInvitesForEvent } from "@/lib/data";

export default function EventsPage() {
  const sorted = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="space-y-6 px-4 py-6 md:px-0 md:py-0">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Events
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          What's on the calendar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          For each event we score collectors on proximity, tier, artist affinity, and prior attendance — modulated by scene-influence so transcontinental flights only fire when the event warrants them.
        </p>
      </header>

      <div className="space-y-3">
        {sorted.map((e) => {
          const invites = getInvitesForEvent(e.id);
          const accepted = invites.filter((i) => i.status === "accepted").length;
          const maybe = invites.filter((i) => i.status === "maybe").length;
          const invited = invites.filter((i) => i.status === "invited").length;
          const shortlisted = invites.filter((i) => i.status === "shortlisted").length;

          return (
            <Link key={e.id} href={`/events/${e.id}`} className="group block">
              <Card className="transition group-hover:border-foreground/30 group-hover:shadow-sm">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {e.kind.replace("-", " ")}
                        </Badge>
                        {e.tier !== "general" ? (
                          <Badge className="bg-foreground text-background text-[10px] capitalize">
                            {e.tier.replace("-", " ")}
                          </Badge>
                        ) : null}
                        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground md:hidden">
                          <Sparkles className="size-3" />
                          {e.influenceScore}/10
                        </span>
                      </div>
                      <h2 className="mt-1.5 font-display text-xl font-semibold leading-tight">
                        {e.name}
                      </h2>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {new Date(e.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {e.city}, {e.country}
                        </span>
                      </p>
                    </div>
                    <div className="hidden flex-col items-end gap-1 md:flex">
                      <p className="inline-flex items-center gap-1 text-xs font-medium">
                        <Sparkles className="size-3" />
                        Influence {e.influenceScore}/10
                      </p>
                      <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 border-t border-border/60 pt-3 text-xs">
                    <Pip label="Accepted" value={accepted} tone="ok" />
                    <Pip label="Maybe" value={maybe} />
                    <Pip label="Invited" value={invited} />
                    <Pip label="Shortlisted" value={shortlisted} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Pip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "ok";
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-0.5 font-medium tabular-nums ${
          tone === "ok" ? "text-emerald-700" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
