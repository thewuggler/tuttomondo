import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageCircle,
  Sparkles,
  Star,
  MapPin,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  artists,
  daysSince,
  formatDays,
  formatMoney,
  getArtwork,
  getCollector,
  getCollectorBrief,
  getCollectorTimeline,
  getPurchasesForCollector,
  getRep,
  getThreadsForCollector,
} from "@/lib/data";
import type { TimelineEntry } from "@/lib/data/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const { collectors } = await import("@/lib/data");
  return collectors.map((c) => ({ id: c.id }));
}

export default async function CollectorPage({ params }: PageProps) {
  const { id } = await params;
  const collector = getCollector(id);
  if (!collector) notFound();
  const rep = getRep(collector.owningRepId);
  const brief = getCollectorBrief(id);
  const timeline = getCollectorTimeline(id);
  const purchases = getPurchasesForCollector(id);
  const threads = getThreadsForCollector(id);

  return (
    <div className="space-y-6 px-4 py-5 md:px-0 md:py-0">
      <Link
        href="/owner"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back
      </Link>

      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-16 md:size-20">
            <AvatarFallback className="bg-secondary font-display text-xl">
              {initials(collector.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                {collector.name}
              </h1>
              <TierBadge tier={collector.tier} />
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {collector.city}, {collector.country}
              </span>
              {rep ? (
                <span>
                  Owned by <span className="font-medium text-foreground">{rep.name}</span>
                </span>
              ) : null}
              <span>
                Last contact {formatDays(daysSince(collector.lastContactAt))}
              </span>
            </p>
            <p className="mt-2 text-sm">
              <span className="font-display text-lg font-medium tabular-nums">
                {formatMoney(collector.lifetimeSpendCents)}
              </span>{" "}
              <span className="text-xs text-muted-foreground">lifetime · since {new Date(collector.joinedAt).getFullYear()}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="gap-2">
            <Mail className="size-3.5" /> Email
          </Button>
          {collector.consent.textOk ? (
            <Button size="sm" variant="outline" className="gap-2">
              <Phone className="size-3.5" /> Text
            </Button>
          ) : null}
          {collector.consent.whatsappOk ? (
            <Button size="sm" variant="outline" className="gap-2">
              <MessageCircle className="size-3.5" /> WhatsApp
            </Button>
          ) : null}
        </div>
      </header>

      {brief.length > 0 ? (
        <Card className="border-foreground/15 bg-gradient-to-b from-card to-muted/30">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-foreground" />
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Brief — what to know going in
              </p>
            </div>
            <ul className="mt-2 space-y-1.5">
              {brief.map((b, i) => (
                <li key={i} className="text-sm leading-snug">
                  — {b}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-fit">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="purchases">
            Purchases <span className="ml-1 text-muted-foreground">{purchases.length}</span>
          </TabsTrigger>
          <TabsTrigger value="inbox">
            Inbox <span className="ml-1 text-muted-foreground">{threads.length}</span>
          </TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4 space-y-3">
          {timeline.length === 0 ? (
            <EmptyBlock title="No history yet" />
          ) : (
            <ol className="relative space-y-3 pl-5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-border">
              {timeline.map((e) => (
                <TimelineRow key={e.id} entry={e} />
              ))}
            </ol>
          )}
        </TabsContent>

        <TabsContent value="purchases" className="mt-4 space-y-2">
          {purchases.length === 0 ? (
            <EmptyBlock title="No purchases yet" detail="First-touch matters — protect this." />
          ) : (
            purchases.map((p) => {
              const w = getArtwork(p.artworkId);
              const artist = w ? artists.find((a) => a.id === w.artistId) : undefined;
              if (!w) return null;
              return (
                <Link
                  key={p.id}
                  href={`/artworks/${w.id}`}
                  className="flex items-center gap-4 rounded-lg border border-border/60 bg-card p-3 transition hover:border-foreground/30 hover:shadow-sm"
                >
                  <ArtworkThumb hue={w.imageHue} title={w.title} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{w.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {artist?.name} · {w.year} · {w.medium}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium tabular-nums">
                      {formatMoney(p.priceCents)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="inbox" className="mt-4 space-y-2">
          {threads.length === 0 ? (
            <EmptyBlock title="No threads yet" />
          ) : (
            threads.map((t) => (
              <Card key={t.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDays(daysSince(t.lastMessageAt))} ·{" "}
                        <span className="capitalize">{t.status.replace("-", " ")}</span>
                      </p>
                    </div>
                    {t.aiFlag === "needs-attention" ? (
                      <Badge className="bg-rose-100 text-rose-800">Needs attention</Badge>
                    ) : t.aiFlag === "deal-momentum" ? (
                      <Badge className="bg-emerald-100 text-emerald-800">Momentum</Badge>
                    ) : null}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {t.messages.map((m) => (
                      <div key={m.id} className="text-sm">
                        <p className="text-xs text-muted-foreground">
                          {m.authorName} ·{" "}
                          {new Date(m.sentAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="mt-0.5 whitespace-pre-line leading-snug">{m.body}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="preferences" className="mt-4 space-y-4">
          <PreferenceBlock
            label="Preferred artists"
            value={collector.preferences.preferredArtists
              .map((id) => artists.find((a) => a.id === id)?.name)
              .filter((x): x is string => !!x)
              .join(" · ")}
          />
          <PreferenceBlock
            label="Mediums"
            value={collector.preferences.preferredMediums.join(" · ")}
          />
          <PreferenceBlock
            label="Themes"
            value={collector.preferences.themes.join(" · ")}
          />
          <PreferenceBlock
            label="Price band"
            value={`${formatMoney(collector.preferences.priceBandCents[0])} – ${formatMoney(collector.preferences.priceBandCents[1])}`}
          />
          {collector.preferences.notes ? (
            <PreferenceBlock label="Notes" value={collector.preferences.notes} />
          ) : null}
          {collector.importantDates.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Important dates
              </p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {collector.importantDates.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Star className="size-3.5 text-muted-foreground" />
                    <span className="font-medium">{d.label}</span>
                    <span className="text-muted-foreground">
                      {new Date(d.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {d.recurring ? " · recurring" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TimelineRow({ entry }: { entry: TimelineEntry }) {
  const tone: Record<string, string> = {
    email: "bg-foreground",
    purchase: "bg-emerald-500",
    event: "bg-amber-500",
    note: "bg-muted-foreground",
    viewing: "bg-foreground",
    "studio-visit": "bg-foreground",
    introduction: "bg-foreground",
  };
  return (
    <li className="relative">
      <span
        className={`absolute -left-[15px] top-1.5 inline-block size-2.5 rounded-full ring-2 ring-background ${tone[entry.kind]}`}
      />
      <p className="text-xs text-muted-foreground">
        {new Date(entry.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}{" "}
        · <span className="capitalize">{entry.kind.replace("-", " ")}</span>
      </p>
      <p className="mt-0.5 text-sm font-medium">{entry.title}</p>
      {entry.detail ? (
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {entry.detail}
        </p>
      ) : null}
    </li>
  );
}

function PreferenceBlock({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

function EmptyBlock({ title, detail }: { title: string; detail?: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="font-medium">{title}</p>
        {detail ? (
          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TierBadge({ tier }: { tier: "vip" | "active" | "dormant" | "prospect" }) {
  const tones: Record<string, string> = {
    vip: "bg-foreground text-background border-transparent",
    active: "bg-secondary text-foreground",
    dormant: "border-amber-300 bg-amber-50 text-amber-900",
    prospect: "border-emerald-300 bg-emerald-50 text-emerald-900",
  };
  return (
    <Badge variant="outline" className={`capitalize ${tones[tier]}`}>
      {tier}
    </Badge>
  );
}

function ArtworkThumb({ hue, title }: { hue: string; title: string }) {
  return (
    <div
      className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md text-[8px] font-medium text-white/80"
      style={{ background: `oklch(0.65 0.15 ${hue})` }}
      aria-label={title}
    >
      <span className="line-clamp-2 px-1 text-center">{title.split(" ").slice(0, 2).join(" ")}</span>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}
