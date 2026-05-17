import {
  artists,
  artworks,
  collectors,
  events,
  gallery,
  nudges,
  purchases,
  reps,
  threads,
} from "./seed";
import type {
  Artist,
  Artwork,
  Collector,
  EmailThread,
  Nudge,
  Purchase,
  Rep,
  RepHealth,
  TimelineEntry,
} from "./types";

export { gallery, reps, artists, artworks, collectors, purchases, threads, events, nudges };

export const today = new Date("2026-05-17T12:00:00Z");

export function getRep(id: string): Rep | undefined {
  return reps.find((r) => r.id === id);
}

export function getCollector(id: string): Collector | undefined {
  return collectors.find((c) => c.id === id);
}

export function getArtwork(id: string): Artwork | undefined {
  return artworks.find((a) => a.id === id);
}

export function getArtist(id: string): Artist | undefined {
  return artists.find((a) => a.id === id);
}

export function getCollectorsForRep(repId: string): Collector[] {
  return collectors.filter((c) => c.owningRepId === repId);
}

export function getThreadsForRep(repId: string): EmailThread[] {
  return threads.filter((t) => t.repId === repId);
}

export function getThreadsForCollector(collectorId: string): EmailThread[] {
  return threads
    .filter((t) => t.collectorId === collectorId)
    .sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );
}

export function getNudgesForRep(repId: string): Nudge[] {
  return nudges.filter((n) => n.repId === repId);
}

export function getPurchasesForCollector(collectorId: string): Purchase[] {
  return purchases
    .filter((p) => p.collectorId === collectorId)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getNeedsReplyThreads(): EmailThread[] {
  return threads
    .filter((t) => t.status === "needs-reply")
    .sort(
      (a, b) =>
        new Date(a.lastMessageAt).getTime() - new Date(b.lastMessageAt).getTime(),
    );
}

export function getRepHealth(repId: string): RepHealth {
  const owned = getCollectorsForRep(repId);
  const repThreads = getThreadsForRep(repId);
  const needsReply = repThreads.filter((t) => t.status === "needs-reply");
  const staleVip = owned.filter(
    (c) =>
      c.tier === "vip" &&
      daysSince(c.lastContactAt) > 21,
  );
  const openDeals = repThreads.filter(
    (t) =>
      t.aiFlag === "deal-momentum" ||
      (t.status === "needs-reply" && t.sentiment !== "frustrated"),
  );
  const avgReplyHours =
    repThreads.length === 0
      ? 0
      : Math.round(
          repThreads.reduce((acc, t) => {
            const last = new Date(t.lastMessageAt).getTime();
            const hours = (Date.now() - last) / 3_600_000;
            return acc + Math.min(hours, 72);
          }, 0) / repThreads.length,
        );
  return {
    repId,
    collectorsOwned: owned.length,
    needsReplyCount: needsReply.length,
    averageReplyHours: avgReplyHours,
    staleVipCount: staleVip.length,
    openDealsCount: openDeals.length,
    thirtyDayMomentum: Math.max(
      0,
      30 - needsReply.length * 3 - staleVip.length * 5,
    ),
  };
}

export function daysSince(iso: string): number {
  const t = new Date(iso).getTime();
  return Math.max(0, Math.floor((today.getTime() - t) / 86_400_000));
}

export function formatDays(n: number): string {
  if (n === 0) return "today";
  if (n === 1) return "yesterday";
  if (n < 30) return `${n}d ago`;
  if (n < 365) return `${Math.round(n / 30)}mo ago`;
  return `${Math.round(n / 365)}y ago`;
}

export function formatMoney(cents: number, currency: "USD" = "USD"): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(dollars);
}

export function getCollectorTimeline(collectorId: string): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  for (const t of getThreadsForCollector(collectorId)) {
    for (const m of t.messages) {
      entries.push({
        id: m.id,
        date: m.sentAt,
        kind: "email",
        title:
          m.direction === "inbound"
            ? `${m.authorName.split(" ")[0]} wrote — "${t.subject}"`
            : `You wrote — "${t.subject}"`,
        detail: m.body.slice(0, 160),
        refId: t.id,
      });
    }
  }
  for (const p of getPurchasesForCollector(collectorId)) {
    const w = getArtwork(p.artworkId);
    entries.push({
      id: p.id,
      date: p.date,
      kind: "purchase",
      title: w ? `Acquired ${w.title}` : `Acquired artwork`,
      detail: w ? `${formatMoney(p.priceCents)} — ${w.medium}` : undefined,
      refId: p.artworkId,
    });
  }
  for (const e of events) {
    if (e.attendeeCollectorIds.includes(collectorId)) {
      entries.push({
        id: e.id,
        date: e.date,
        kind: "event",
        title: e.name,
        detail: `${e.kind.replace("-", " ")} — ${e.city}`,
        refId: e.id,
      });
    }
  }
  return entries.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getCollectorBrief(collectorId: string): string[] {
  const c = getCollector(collectorId);
  if (!c) return [];
  const purchases = getPurchasesForCollector(collectorId);
  const threads = getThreadsForCollector(collectorId);
  const lines: string[] = [];

  const last = daysSince(c.lastContactAt);
  if (last > 30) lines.push(`Last contact was ${formatDays(last)} — re-engagement window is closing.`);
  else lines.push(`Last contact ${formatDays(last)} — relationship is current.`);

  if (purchases.length > 0) {
    const last = purchases[0];
    const w = getArtwork(last.artworkId);
    lines.push(
      `${purchases.length} acquisitions on the books. Most recent: ${
        w?.title ?? "untitled work"
      } (${formatMoney(last.priceCents)}).`,
    );
  } else if (c.tier === "prospect") {
    lines.push("Prospect — no acquisitions yet. Treat the first piece carefully.");
  }

  const openQs = threads
    .map((t) => t.unresolvedQuestion)
    .filter((q): q is string => !!q);
  if (openQs.length > 0) {
    lines.push(`Open thread: ${openQs[0]}`);
  }

  const nextDate = c.importantDates
    .map((d) => ({ ...d, ts: new Date(d.date).getTime() }))
    .filter((d) => d.ts >= today.getTime())
    .sort((a, b) => a.ts - b.ts)[0];
  if (nextDate) {
    lines.push(
      `Upcoming: ${nextDate.label} (${new Date(nextDate.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}).`,
    );
  }

  if (c.privateNote) lines.push(c.privateNote);
  return lines;
}

export function getAttentionList(): Array<{
  collector: Collector;
  rep: Rep;
  reason: string;
  severity: "high" | "medium" | "low";
}> {
  const out: Array<{
    collector: Collector;
    rep: Rep;
    reason: string;
    severity: "high" | "medium" | "low";
  }> = [];
  for (const n of nudges) {
    const collector = getCollector(n.collectorId);
    const rep = getRep(n.repId);
    if (!collector || !rep) continue;
    out.push({ collector, rep, reason: n.reason, severity: n.severity });
  }
  return out.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 } as const;
    return order[a.severity] - order[b.severity];
  });
}
