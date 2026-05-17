import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  artists,
  collectors,
  formatMoney,
  getArtist,
  getArtwork,
  getCollector,
} from "@/lib/data";
import type { Artwork, ArtworkLocation } from "@/lib/data/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const { artworks } = await import("@/lib/data");
  return artworks.map((a) => ({ id: a.id }));
}

export default async function ArtworkPage({ params }: PageProps) {
  const { id } = await params;
  const w = getArtwork(id);
  if (!w) notFound();
  const artist = getArtist(w.artistId);
  const matches = computeMatches(w);

  return (
    <div className="space-y-6 px-4 py-5 md:px-0 md:py-0">
      <Link
        href="/owner"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back
      </Link>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3">
          <div
            className="flex aspect-[4/5] items-end overflow-hidden rounded-xl border border-border/60 p-6"
            style={{
              background: `linear-gradient(135deg, oklch(0.65 0.18 ${w.imageHue}), oklch(0.45 0.18 ${(parseInt(w.imageHue) + 60) % 360}))`,
            }}
          >
            <div className="text-white">
              <p className="text-xs uppercase tracking-wider opacity-70">
                {artist?.name}
              </p>
              <h2 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
                {w.title}
              </h2>
              <p className="mt-1 text-sm opacity-90">
                {w.year} · {w.medium}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 md:col-span-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {artist?.name}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight">
              {w.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {w.year} · {w.medium} · {w.dimensions}
            </p>
            {w.edition ? (
              <p className="text-sm text-muted-foreground">{w.edition}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={w.status} />
            <span className="text-xs text-muted-foreground">·</span>
            <LocationLabel location={w.location} />
          </div>

          <div>
            <p className="font-display text-2xl font-semibold tabular-nums">
              {formatMoney(w.priceCents)}
            </p>
          </div>

          {w.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {w.tags.map((t) => (
                <Badge key={t} variant="outline" className="text-[10px] capitalize">
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}

          {w.description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {w.description}
            </p>
          ) : null}
        </div>
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Provenance
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Chain of custody — captured on intake and on every move.
        </p>
        <ol className="mt-3 relative space-y-3 pl-5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-border">
          {w.provenance.map((p) => (
            <li key={p.id} className="relative">
              <span className="absolute -left-[15px] top-1.5 inline-block size-2.5 rounded-full bg-foreground ring-2 ring-background" />
              <p className="text-xs text-muted-foreground">
                {new Date(p.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                · <span className="capitalize">{p.event}</span>
              </p>
              <p className="mt-0.5 text-sm font-medium">{p.actor}</p>
              {p.note ? (
                <p className="text-xs text-muted-foreground">{p.note}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="flex items-center gap-2">
          <Sparkles className="size-4" />
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Would land for
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {matches.length} collectors with strong fit — based on prior acquisitions, stated preferences, and conversation history.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {matches.map((m) => (
            <Link
              key={m.collector.id}
              href={`/collectors/${m.collector.id}`}
              className="block"
            >
              <Card className="transition hover:border-foreground/30 hover:shadow-sm">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{m.collector.name}</p>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {m.collector.tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {m.collector.city} · {formatMoney(m.collector.lifetimeSpendCents)} lifetime
                  </p>
                  <Separator />
                  <ul className="space-y-0.5 text-xs">
                    {m.reasons.map((r, i) => (
                      <li key={i} className="text-muted-foreground">— {r}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function computeMatches(w: Artwork) {
  return collectors
    .map((c) => {
      const reasons: string[] = [];
      if (c.preferences.preferredArtists.includes(w.artistId)) {
        const a = artists.find((x) => x.id === w.artistId);
        reasons.push(`Preferred artist (${a?.name ?? ""})`);
      }
      if (c.preferences.preferredMediums.some((m) => w.medium.toLowerCase().includes(m.toLowerCase()))) {
        reasons.push("Medium matches stated preference");
      }
      const inBand =
        w.priceCents >= c.preferences.priceBandCents[0] &&
        w.priceCents <= c.preferences.priceBandCents[1];
      if (inBand) reasons.push("In stated price band");
      const themeOverlap = c.preferences.themes.filter((t) => w.tags.includes(t));
      if (themeOverlap.length > 0)
        reasons.push(`Theme overlap: ${themeOverlap.join(", ")}`);
      return { collector: c, score: reasons.length, reasons };
    })
    .filter((m) => m.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

function StatusBadge({
  status,
}: {
  status: "available" | "held" | "sold" | "consigned-out" | "consigned-in";
}) {
  const tones: Record<string, string> = {
    available: "bg-emerald-100 text-emerald-800 border-transparent",
    held: "bg-amber-100 text-amber-800 border-transparent",
    sold: "bg-secondary text-muted-foreground border-transparent",
    "consigned-out": "bg-foreground text-background border-transparent",
    "consigned-in": "border-foreground/30 text-foreground",
  };
  const label: Record<string, string> = {
    available: "Available",
    held: "On hold",
    sold: "Sold",
    "consigned-out": "Out on consignment",
    "consigned-in": "Consigned in",
  };
  return (
    <Badge variant="outline" className={`capitalize ${tones[status]}`}>
      {label[status]}
    </Badge>
  );
}

function LocationLabel({ location }: { location: ArtworkLocation }) {
  let text = "";
  switch (location.kind) {
    case "gallery":
      text = `Gallery${location.room ? ` — ${location.room}` : ""}`;
      break;
    case "storage":
      text = `Storage — ${location.facility}`;
      break;
    case "client":
      text = `At ${getCollector(location.collectorId)?.name ?? "collector"}`;
      break;
    case "art-fair":
      text = `${location.fair}${location.booth ? `, ${location.booth}` : ""}`;
      break;
    case "conservator":
      text = `Conservator — ${location.name}`;
      break;
    case "shipping":
      text = `Shipping — ${location.carrier}${location.eta ? ` (ETA ${location.eta})` : ""}`;
      break;
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <MapPin className="size-3" /> {text}
    </span>
  );
}
