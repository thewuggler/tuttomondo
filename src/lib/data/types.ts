export type Persona = "owner" | "rep";

export type CollectorTier = "vip" | "active" | "dormant" | "prospect";

export type ArtworkStatus =
  | "available"
  | "held"
  | "sold"
  | "consigned-out"
  | "consigned-in";

export type ArtworkLocation =
  | { kind: "gallery"; room?: string }
  | { kind: "storage"; facility: string }
  | { kind: "client"; collectorId: string }
  | { kind: "art-fair"; fair: string; booth?: string }
  | { kind: "conservator"; name: string }
  | { kind: "shipping"; carrier: string; eta?: string };

export type ThreadStatus =
  | "needs-reply"
  | "awaiting-collector"
  | "resolved"
  | "internal-thread";

export type ThreadSentiment = "warm" | "neutral" | "cooling" | "frustrated";

export type ProvenanceEvent =
  | "created"
  | "acquired"
  | "consigned"
  | "exhibited"
  | "sold"
  | "loaned"
  | "conserved"
  | "shipped";

export interface Gallery {
  id: string;
  name: string;
  city: string;
  founded: number;
  about: string;
}

export interface Rep {
  id: string;
  name: string;
  role: "owner" | "director" | "rep" | "assistant";
  title: string;
  email: string;
  initials: string;
  joinedAt: string;
  bio?: string;
}

export interface Artist {
  id: string;
  name: string;
  born: number;
  died?: number;
  nationality: string;
  representation: "represented" | "estate" | "secondary";
  bio: string;
}

export interface ProvenanceEntry {
  id: string;
  date: string;
  event: ProvenanceEvent;
  actor: string;
  note?: string;
  documentId?: string;
}

export interface Artwork {
  id: string;
  title: string;
  artistId: string;
  year: number;
  medium: string;
  dimensions: string;
  edition?: string;
  imageUrl: string;
  imageHue: string;
  status: ArtworkStatus;
  priceCents: number;
  currency: "USD";
  location: ArtworkLocation;
  provenance: ProvenanceEntry[];
  tags: string[];
  description?: string;
}

export interface CollectorPreferences {
  preferredArtists: string[];
  preferredMediums: string[];
  priceBandCents: [number, number];
  themes: string[];
  notes?: string;
}

export interface ImportantDate {
  label: string;
  date: string;
  recurring?: boolean;
}

export interface Collector {
  id: string;
  name: string;
  tier: CollectorTier;
  city: string;
  country: string;
  email: string;
  phone?: string;
  owningRepId: string;
  lifetimeSpendCents: number;
  lastContactAt: string;
  joinedAt: string;
  introducedBy?: string;
  preferences: CollectorPreferences;
  importantDates: ImportantDate[];
  privateNote?: string;
  consent: { textOk: boolean; emailOk: boolean; whatsappOk: boolean };
}

export interface Purchase {
  id: string;
  collectorId: string;
  artworkId: string;
  repId: string;
  date: string;
  priceCents: number;
  paymentTerms?: string;
  internalNote?: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  direction: "inbound" | "outbound";
  authorName: string;
  authorEmail: string;
  sentAt: string;
  body: string;
}

export interface EmailThread {
  id: string;
  collectorId: string;
  repId: string;
  subject: string;
  status: ThreadStatus;
  sentiment: ThreadSentiment;
  lastMessageAt: string;
  unresolvedQuestion?: string;
  aiFlag?: "needs-attention" | "stale" | "deal-momentum" | "ok";
  messages: EmailMessage[];
}

export interface TimelineEntry {
  id: string;
  date: string;
  kind:
    | "email"
    | "purchase"
    | "event"
    | "note"
    | "viewing"
    | "studio-visit"
    | "introduction";
  title: string;
  detail?: string;
  refId?: string;
}

export type EventTier = "general" | "vip-preview" | "intimate" | "artist-meet";

export type EventInviteStatus =
  | "shortlisted"
  | "invited"
  | "accepted"
  | "maybe"
  | "declined";

export interface Event {
  id: string;
  name: string;
  kind: "opening" | "art-fair" | "private-viewing" | "dinner" | "studio-visit";
  date: string;
  city: string;
  country: string;
  tier: EventTier;
  influenceScore: number;
  influenceNote: string;
  featuredArtistIds: string[];
  attendeeCollectorIds: string[];
}

export interface EventInvite {
  id: string;
  eventId: string;
  collectorId: string;
  status: EventInviteStatus;
  rsvpAt?: string;
  note?: string;
}

export interface Nudge {
  id: string;
  collectorId: string;
  repId: string;
  reason: string;
  severity: "low" | "medium" | "high";
  suggestedDraft?: string;
  suggestedSubject?: string;
}

export interface RepHealth {
  repId: string;
  collectorsOwned: number;
  needsReplyCount: number;
  averageReplyHours: number;
  staleVipCount: number;
  openDealsCount: number;
  thirtyDayMomentum: number;
}
