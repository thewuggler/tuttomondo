import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  daysSince,
  formatDays,
  getCollector,
  getRep,
  getThreadsForRep,
} from "@/lib/data";
import type { EmailThread } from "@/lib/data/types";

interface PageProps {
  params: Promise<{ rep: string }>;
}

export async function generateStaticParams() {
  const { reps } = await import("@/lib/data");
  return reps.map((r) => ({ rep: r.id }));
}

export default async function RepInboxPage({ params }: PageProps) {
  const { rep: repId } = await params;
  const rep = getRep(repId);
  if (!rep) notFound();

  const threads = getThreadsForRep(repId).sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );

  const groups: Array<{ label: string; threads: EmailThread[] }> = [
    {
      label: "Needs reply",
      threads: threads.filter((t) => t.status === "needs-reply"),
    },
    {
      label: "Awaiting collector",
      threads: threads.filter((t) => t.status === "awaiting-collector"),
    },
    {
      label: "Resolved",
      threads: threads.filter((t) => t.status === "resolved"),
    },
  ];

  return (
    <div className="space-y-6 px-4 py-5 md:px-0 md:py-0">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Inbox
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {rep.name.split(" ")[0]}'s threads
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything across email today. WhatsApp and SMS land here next.
        </p>
      </header>

      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.label}>
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {g.label} · {g.threads.length}
            </h2>
            <div className="mt-2 space-y-2">
              {g.threads.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    Nothing here.
                  </CardContent>
                </Card>
              ) : (
                g.threads.map((t) => {
                  const c = getCollector(t.collectorId);
                  if (!c) return null;
                  const last = t.messages[t.messages.length - 1];
                  return (
                    <Link
                      key={t.id}
                      href={`/collectors/${c.id}`}
                      className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3 transition hover:border-foreground/30 hover:shadow-sm"
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
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-medium">{c.name}</p>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatDays(daysSince(t.lastMessageAt))}
                          </span>
                        </div>
                        <p className="truncate text-sm">{t.subject}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {last?.body}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          {t.aiFlag === "needs-attention" ? (
                            <Badge className="bg-rose-100 text-rose-800 text-[10px]">
                              Needs attention
                            </Badge>
                          ) : t.aiFlag === "deal-momentum" ? (
                            <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                              Momentum
                            </Badge>
                          ) : t.aiFlag === "stale" ? (
                            <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                              Stale
                            </Badge>
                          ) : null}
                          {t.sentiment === "frustrated" ? (
                            <span className="text-[10px] font-medium text-rose-700">
                              Tone: frustrated
                            </span>
                          ) : t.sentiment === "cooling" ? (
                            <span className="text-[10px] font-medium text-amber-700">
                              Tone: cooling
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
