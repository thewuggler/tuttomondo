import {
  artists,
  artworks,
  collectors,
  eventInvites,
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
  Event,
  EventInvite,
  Nudge,
  Purchase,
  Rep,
  RepHealth,
  TimelineEntry,
} from "./types";

export {
  gallery,
  reps,
  artists,
  artworks,
  collectors,
  purchases,
  threads,
  events,
  eventInvites,
  nudges,
};

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

export function getEvent(id: string): Event | undefined {
  return events.find((e) => e.id === id);
}

export function getInvitesForEvent(eventId: string): EventInvite[] {
  return eventInvites.filter((i) => i.eventId === eventId);
}

export function getInvitesForCollector(collectorId: string): EventInvite[] {
  return eventInvites.filter((i) => i.collectorId === collectorId);
}

const sameCountryRegion: Record<string, string> = {
  US: "north-america",
  CA: "north-america",
  MX: "north-america",
  GB: "europe",
  IE: "europe",
  FR: "europe",
  DE: "europe",
  IT: "europe",
  ES: "europe",
  CH: "europe",
  AT: "europe",
  NL: "europe",
  BE: "europe",
  PT: "europe",
  PL: "europe",
  SE: "europe",
  NO: "europe",
  DK: "europe",
  FI: "europe",
  JP: "asia-pacific",
  KR: "asia-pacific",
  HK: "asia-pacific",
  SG: "asia-pacific",
  AU: "asia-pacific",
  IL: "middle-east",
  AE: "middle-east",
  LB: "middle-east",
  EG: "middle-east",
  BR: "latin-america",
  AR: "latin-america",
};

export function travelFrictionScore(
  collectorCountry: string,
  collectorCity: string,
  eventCountry: string,
  eventCity: string,
): { friction: number; label: string } {
  if (
    collectorCountry === eventCountry &&
    collectorCity.toLowerCase() === eventCity.toLowerCase()
  ) {
    return { friction: 0, label: "local" };
  }
  if (collectorCountry === eventCountry) {
    return { friction: 1, label: "in-country" };
  }
  const cr = sameCountryRegion[collectorCountry];
  const er = sameCountryRegion[eventCountry];
  if (cr && er && cr === er) return { friction: 2, label: "same region" };
  return { friction: 3, label: "transcontinental" };
}

export interface EventScore {
  collector: Collector;
  score: number;
  likelihood: "high" | "medium" | "low" | "unlikely";
  signals: Array<{ kind: "ok" | "info" | "warn"; text: string }>;
}

export function scoreCollectorForEvent(
  collector: Collector,
  event: Event,
): EventScore {
  const signals: EventScore["signals"] = [];
  let score = 0;

  const friction = travelFrictionScore(
    collector.country,
    collector.city,
    event.country,
    event.city,
  );
  const frictionBoost = [3, 2, 1, -1][friction.friction] ?? -1;
  score += frictionBoost;
  if (friction.friction <= 1) {
    signals.push({ kind: "ok", text: `Proximity (${friction.label})` });
  } else if (friction.friction === 2) {
    signals.push({
      kind: "info",
      text: `Same region — ${event.influenceScore >= 8 ? "worth the flight" : "marginal travel call"}`,
    });
  } else {
    signals.push({
      kind: "info",
      text: `Transcontinental — only attends if scene-influence is high`,
    });
  }

  const influenceLift = Math.max(0, event.influenceScore - 5);
  score += influenceLift;
  if (event.influenceScore >= 8) {
    signals.push({
      kind: "ok",
      text: `Scene influence ${event.influenceScore}/10 — collectors of this profile typically attend`,
    });
  }

  const featuredOverlap = event.featuredArtistIds.filter((a) =>
    collector.preferences.preferredArtists.includes(a),
  );
  if (featuredOverlap.length > 0) {
    score += 4;
    const artistNames = featuredOverlap
      .map((id) => artists.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .join(" + ");
    signals.push({ kind: "ok", text: `Preferred artist showing — ${artistNames}` });
  }

  if (collector.tier === "vip") {
    score += 2;
    if (event.tier === "vip-preview" || event.tier === "intimate") {
      score += 3;
      signals.push({ kind: "ok", text: `Tier match — VIP collector for ${event.tier.replace("-", " ")} event` });
    }
  } else if (collector.tier === "active") {
    score += 1;
  } else if (collector.tier === "prospect") {
    if (event.tier === "intimate") {
      score -= 4;
      signals.push({
        kind: "warn",
        text: "Prospect — intimate event likely not the right first touch",
      });
    }
  } else if (collector.tier === "dormant") {
    score -= 1;
  }

  const traveling = collector.importantDates.some(
    (d) =>
      d.label.toLowerCase().includes(event.city.toLowerCase()) ||
      d.label.toLowerCase().includes(event.name.toLowerCase().split(" ")[0]),
  );
  if (traveling) {
    score += 5;
    signals.push({ kind: "ok", text: "Stated travel window matches event date" });
  }

  const priorAttendance = eventInvites.some(
    (i) =>
      i.collectorId === collector.id &&
      i.status === "accepted" &&
      events.find((e) => e.id === i.eventId)?.kind === event.kind,
  );
  if (priorAttendance) {
    score += 2;
    signals.push({ kind: "ok", text: `Attended a ${event.kind.replace("-", " ")} before` });
  }

  let likelihood: EventScore["likelihood"];
  if (score >= 10) likelihood = "high";
  else if (score >= 6) likelihood = "medium";
  else if (score >= 2) likelihood = "low";
  else likelihood = "unlikely";

  return { collector, score, likelihood, signals };
}

export function getRepSocialCalendar(repId: string) {
  return events
    .map((e) => {
      const reps = getInvitesForEvent(e.id)
        .filter((i) => i.status === "accepted" || i.status === "maybe")
        .map((i) => ({ invite: i, collector: getCollector(i.collectorId) }))
        .filter(
          (row): row is { invite: EventInvite; collector: Collector } =>
            !!row.collector && row.collector.owningRepId === repId,
        );
      return { event: e, attendees: reps };
    })
    .filter((row) => row.attendees.length > 0)
    .sort((a, b) => +new Date(a.event.date) - +new Date(b.event.date));
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
