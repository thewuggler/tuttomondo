import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Sparkles,
  Plane,
  Star,
  ListFilter,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  artists,
  collectors,
  events,
  getEvent,
  getInvitesForEvent,
  scoreCollectorForEvent,
} from "@/lib/data";
import type {
  EventInvite,
  EventInviteStatus,
} from "@/lib/data/types";

export async function generateStaticParams() {
  return events.map((e) => ({ id: e.id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) notFound();

  const invites = getInvitesForEvent(event.id);
  const invitedIds = new Set(invites.map((i) => i.collectorId));

  const shortlist = collectors
    .filter((c) => !invitedIds.has(c.id))
    .map((c) => scoreCollectorForEvent(c, event))
    .filter((s) => s.likelihood === "high" || s.likelihood === "medium")
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const pipeline = groupByStatus(invites);
  const featuredArtists = event.featuredArtistIds
    .map((id) => artists.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a);

  return (
    <div className="space-y-6 px-4 py-5 md:px-0 md:py-0">
      <Link
        href="/events"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All events
      </Link>

      <header>
        <Badge variant="outline" className="capitalize">
          {event.kind.replace("-", " ")} · {event.tier.replace("-", " ")}
        </Badge>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {event.name}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" />
            {new Date(event.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {event.city}, {event.country}
          </span>
          {featuredArtists.length > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5" /> Featuring{" "}
              {featuredArtists.map((a) => a.name).join(" + ")}
            </span>
          ) : null}
        </p>
      </header>

      <Card className="border-foreground/15 bg-gradient-to-b from-card to-muted/30">
        <CardContent className="space-y-2 p-4 md:p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Scene influence — {event.influenceScore}/10
            </p>
          </div>
          <p className="text-sm leading-snug text-foreground">
            {event.influenceNote}
          </p>
          <p className="pt-1 text-xs text-muted-foreground">
            Refreshed nightly from art-press coverage, peer-gallery attendance, and acquisitions activity around the event.
          </p>
          <Separator className="my-2" />
          <div className="grid grid-cols-2 gap-4 pt-1 md:grid-cols-4">
            <Stat label="Accepted" value={pipeline.accepted.length} tone="ok" />
            <Stat label="Maybe" value={pipeline.maybe.length} />
            <Stat label="Invited" value={pipeline.invited.length} />
            <Stat label="Shortlisted" value={pipeline.shortlisted.length} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="shortlist" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-fit">
          <TabsTrigger value="shortlist">
            <ListFilter className="mr-1.5 size-3.5" />
            Smart shortlist
          </TabsTrigger>
          <TabsTrigger value="pipeline">RSVP pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="shortlist" className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Deterministic scoring: proximity, tier match, artist affinity, prior attendance, stated travel.
            The scene-influence score above modulates the travel call.
          </p>
          {shortlist.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Everyone who'd land for this event has already been invited.
              </CardContent>
            </Card>
          ) : (
            shortlist.map((s) => (
              <Card key={s.collector.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-secondary text-xs font-medium">
                        {initialsOf(s.collector.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/collectors/${s.collector.id}`}
                          className="font-medium hover:underline"
                        >
                          {s.collector.name}
                        </Link>
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {s.collector.tier}
                        </Badge>
                        <LikelihoodChip likelihood={s.likelihood} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {s.collector.city}, {s.collector.country}
                      </p>
                    </div>
                    <Button size="sm">Invite</Button>
                  </div>
                  <ul className="space-y-1">
                    {s.signals.map((sig, i) => (
                      <li
                        key={i}
                        className={`flex items-start gap-1.5 text-xs ${
                          sig.kind === "ok"
                            ? "text-foreground"
                            : sig.kind === "warn"
                            ? "text-amber-700"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span className="mt-1 inline-block size-1 shrink-0 rounded-full bg-current opacity-70" />
                        {sig.text}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pipeline" className="mt-4 space-y-5">
          {(["accepted", "maybe", "invited", "shortlisted", "declined"] as const).map((status) => {
            const rows = pipeline[status];
            if (rows.length === 0) return null;
            return (
              <section key={status}>
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {status} · {rows.length}
                </h3>
                <div className="mt-2 space-y-2">
                  {rows.map((inv) => {
                    const c = collectors.find((x) => x.id === inv.collectorId);
                    if (!c) return null;
                    return (
                      <Link
                        key={inv.id}
                        href={`/collectors/${c.id}`}
                        className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 transition hover:border-foreground/30"
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
                            {c.city} · {travelLabel(c.country, event.country)}
                          </p>
                        </div>
                        {inv.note ? (
                          <span className="hidden text-xs italic text-muted-foreground md:inline">
                            "{inv.note}"
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function groupByStatus(invites: EventInvite[]) {
  const empty: Record<EventInviteStatus, EventInvite[]> = {
    shortlisted: [],
    invited: [],
    accepted: [],
    maybe: [],
    declined: [],
  };
  for (const i of invites) empty[i.status].push(i);
  return empty;
}

function Stat({
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
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`font-display text-2xl font-semibold tabular-nums ${
          tone === "ok" ? "text-emerald-700" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function LikelihoodChip({
  likelihood,
}: {
  likelihood: "high" | "medium" | "low" | "unlikely";
}) {
  const tones: Record<string, string> = {
    high: "bg-emerald-100 text-emerald-800 border-transparent",
    medium: "bg-amber-100 text-amber-800 border-transparent",
    low: "bg-secondary text-foreground",
    unlikely: "bg-secondary text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={`text-[10px] capitalize ${tones[likelihood]}`}>
      {likelihood} likelihood
    </Badge>
  );
}

function travelLabel(collectorCountry: string, eventCountry: string) {
  if (collectorCountry === eventCountry) return "local / domestic";
  return "needs to travel";
}

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("");
}
