import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  artworks,
  formatMoney,
  getArtist,
} from "@/lib/data";

export default function InventoryPage() {
  const byStatus = {
    available: artworks.filter((w) => w.status === "available"),
    held: artworks.filter((w) => w.status === "held"),
    consigned: artworks.filter(
      (w) => w.status === "consigned-out" || w.status === "consigned-in",
    ),
    sold: artworks.filter((w) => w.status === "sold"),
  };

  return (
    <div className="space-y-6 px-4 py-6 md:px-0 md:py-0">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Inventory
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {artworks.length} works
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {byStatus.available.length} available · {byStatus.held.length} on hold · {byStatus.consigned.length} on consignment · {byStatus.sold.length} sold
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {artworks.map((w) => {
          const artist = getArtist(w.artistId);
          return (
            <Link
              key={w.id}
              href={`/artworks/${w.id}`}
              className="group block"
            >
              <div
                className="flex aspect-[4/5] items-end overflow-hidden rounded-lg border border-border/60 p-3 transition group-hover:border-foreground/30"
                style={{
                  background: `linear-gradient(135deg, oklch(0.65 0.18 ${w.imageHue}), oklch(0.45 0.18 ${(parseInt(w.imageHue) + 60) % 360}))`,
                }}
              >
                <div className="text-white">
                  <p className="text-[10px] uppercase tracking-wider opacity-80">
                    {artist?.name}
                  </p>
                  <p className="font-display text-sm font-medium leading-tight">
                    {w.title}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium">{w.title}</p>
                  <p className="shrink-0 text-sm font-medium tabular-nums">
                    {formatMoney(w.priceCents)}
                  </p>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {artist?.name} · {w.year}
                </p>
                <div className="mt-1">
                  <StatusPill status={w.status} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: "available" | "held" | "sold" | "consigned-out" | "consigned-in";
}) {
  const tones: Record<string, string> = {
    available: "bg-emerald-50 text-emerald-800 border-emerald-200",
    held: "bg-amber-50 text-amber-800 border-amber-200",
    sold: "bg-secondary text-muted-foreground",
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
    <Badge variant="outline" className={`text-[10px] ${tones[status]}`}>
      {label[status]}
    </Badge>
  );
}
