import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, MapPin, Sparkles, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DraftSheet } from "@/components/draft-sheet";
import {
  collectors,
  daysSince,
  formatDays,
  getCollector,
  getCollectorBrief,
  getNudgesForRep,
  getRep,
  getRepSocialCalendar,
  getThreadsForCollector,
  getThreadsForRep,
} from "@/lib/data";
import type { Nudge } from "@/lib/data/types";

interface PageProps {
  params: Promise<{ rep: string }>;
}

export async function generateStaticParams() {
  const { reps } = await import("@/lib/data");
  return reps.map((r) => ({ rep: r.id }));
}

export default async function RepTodayPage({ params }: PageProps) {
  const { rep: repId } = await params;
  const rep = getRep(repId);
  if (!rep) notFound();

  const nudges = getNudgesForRep(repId);
  const repThreads = getThreadsForRep(repId);
  const needsReply = repThreads
    .filter((t) => t.status === "needs-reply")
    .sort(
      (a, b) =>
        new Date(a.lastMessageAt).getTime() -
        new Date(b.lastMessageAt).getTime(),
    );

  const myCollectors = collectors.filter((c) => c.owningRepId === repId);
  const myVIPs = myCollectors.filter((c) => c.tier === "vip");

  const upcomingDates = myCollectors
    .flatMap((c) =>
      c.importantDates.map((d) => ({
        collector: c,
        ...d,
      })),
    )
    .map((d) => ({ ...d, ts: new Date(d.date).getTime() }))
    .filter((d) => d.ts >= Date.now() - 86_400_000)
    .sort((a, b) => a.ts - b.ts)
    .slice(0, 4);

  const socialCalendar = getRepSocialCalendar(repId);

  const firstName = rep.name.split(" ")[0];

  return (
    <div className="space-y-6 px-4 py-5 md:px-0 md:py-0">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Today · Saturday, May 17
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Good morning, {firstName}.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {nudges.length} relationships need a moment. {needsReply.length} threads to close out. {myVIPs.length} VIPs on your book.
        </p>
      </header>

      <section>
        <div className="flex items-center gap-2">
          <Wand2 className="size-4" />
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Drafts ready
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Written in your voice. You review, you send.
        </p>

        <div className="mt-3 space-y-3">
          {nudges.length === 0 ? (
            <EmptyCard
              title="No drafts ready"
              detail="When a thread needs you, we'll prepare something."
            />
          ) : (
            nudges.map((n) => <NudgeCard key={n.id} nudge={n} />)
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Needs reply
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Oldest first. The kind of silence collectors remember.
        </p>
        <div className="mt-3 space-y-2">
          {needsReply.map((t) => {
            const c = getCollector(t.collectorId);
            if (!c) return null;
            const last = daysSince(t.lastMessageAt);
            return (
              <Link
                key={t.id}
                href={`/collectors/${c.id}`}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 transition hover:border-foreground/30 hover:shadow-sm"
              >
                <Avatar className="size-9">
                  <AvatarFallback className="bg-secondary text-xs font-medium">
                    {initialsOf(c.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{c.name}</p>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {c.tier}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.subject} · {formatDays(last)}
                  </p>
                </div>
                <SentimentTag sentiment={t.sentiment} />
              </Link>
            );
          })}
        </div>
      </section>

      {socialCalendar.length > 0 ? (
        <section>
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Where you'll see them
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Your collectors' confirmed and likely event attendance — your social calendar.
          </p>
          <div className="mt-3 space-y-2">
            {socialCalendar.map(({ event, attendees }) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block rounded-lg border border-border/60 bg-card p-3 transition hover:border-foreground/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{event.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      · {event.city}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium tabular-nums">
                    {attendees.filter((a) => a.invite.status === "accepted").length} ·{" "}
                    <span className="text-muted-foreground">
                      {attendees.filter((a) => a.invite.status === "maybe").length} maybe
                    </span>
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {attendees.map(({ collector, invite }) => (
                    <span
                      key={invite.id}
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        invite.status === "accepted"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {collector.name}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Calendar className="size-4" />
            <CardTitle className="text-base">Coming up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {upcomingDates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming dates on the book.
              </p>
            ) : (
              upcomingDates.map((d, i) => (
                <Link
                  key={i}
                  href={`/collectors/${d.collector.id}`}
                  className="-mx-2 block rounded-md px-2 py-1.5 transition hover:bg-accent/60"
                >
                  <p className="text-sm font-medium">
                    {d.collector.name} — {d.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Sparkles className="size-4" />
            <CardTitle className="text-base">Cadence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm">
            <CadenceRow label="VIPs (≤ 2 wk cadence)" status={myVIPs.length} flag="ok" />
            <CadenceRow
              label="Stale VIPs"
              status={myVIPs.filter((c) => daysSince(c.lastContactAt) > 21).length}
              flag="warn"
            />
            <CadenceRow
              label="Dormant collectors"
              status={myCollectors.filter((c) => c.tier === "dormant").length}
              flag="neutral"
            />
            <CadenceRow
              label="New prospects"
              status={myCollectors.filter((c) => c.tier === "prospect").length}
              flag="ok"
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function NudgeCard({ nudge }: { nudge: Nudge }) {
  const collector = getCollector(nudge.collectorId);
  if (!collector) return null;
  const threads = getThreadsForCollector(collector.id);
  const thread = threads.find((t) => t.unresolvedQuestion) ?? threads[0];
  const brief = getCollectorBrief(collector.id).slice(0, 2);

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-secondary text-xs font-medium">
              {initialsOf(collector.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/collectors/${collector.id}`}
                className="truncate font-medium hover:underline"
              >
                {collector.name}
              </Link>
              <Badge variant="outline" className="capitalize text-[10px]">
                {collector.tier}
              </Badge>
              <SeverityChip severity={nudge.severity} />
            </div>
            <p className="text-xs text-muted-foreground">
              {collector.city} · last contact {formatDays(daysSince(collector.lastContactAt))}
            </p>
          </div>
        </div>

        <p className="text-sm leading-snug text-foreground">{nudge.reason}</p>

        {brief.length > 0 ? (
          <ul className="space-y-1 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
            {brief.map((b, i) => (
              <li key={i} className="leading-snug">— {b}</li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <DraftSheet
            trigger={
              <Button size="sm" className="gap-2">
                <Wand2 className="size-3.5" />
                View draft
              </Button>
            }
            collector={collector}
            thread={thread}
            nudge={nudge}
          />
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/collectors/${collector.id}`} />}
          >
            Open profile
            <ArrowRight className="ml-1 size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyCard({ title, detail }: { title: string; detail: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function SeverityChip({
  severity,
}: {
  severity: "high" | "medium" | "low";
}) {
  const tones: Record<string, string> = {
    high: "bg-rose-100 text-rose-800 border-rose-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-secondary text-foreground border-border",
  };
  const labels: Record<string, string> = {
    high: "high",
    medium: "medium",
    low: "low",
  };
  return (
    <span
      className={`rounded-full border px-1.5 text-[10px] font-medium capitalize ${tones[severity]}`}
    >
      {labels[severity]}
    </span>
  );
}

function SentimentTag({
  sentiment,
}: {
  sentiment: "warm" | "neutral" | "cooling" | "frustrated";
}) {
  if (sentiment === "warm") return null;
  const tones: Record<string, string> = {
    cooling: "text-amber-700",
    frustrated: "text-rose-700",
    neutral: "text-muted-foreground",
  };
  return (
    <span className={`text-[11px] font-medium capitalize ${tones[sentiment]}`}>
      {sentiment}
    </span>
  );
}

function CadenceRow({
  label,
  status,
  flag,
}: {
  label: string;
  status: number;
  flag: "ok" | "warn" | "neutral";
}) {
  const tones: Record<string, string> = {
    ok: "text-foreground",
    warn: "text-amber-700",
    neutral: "text-muted-foreground",
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums font-medium ${tones[flag]}`}>{status}</span>
    </div>
  );
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}
