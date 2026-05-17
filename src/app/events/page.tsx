import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { events, getCollector } from "@/lib/data";

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
          Tag collectors to events; AI surfaces who to invite based on the proximity, the artist, and the relationship.
        </p>
      </header>

      <div className="space-y-3">
        {sorted.map((e) => (
          <Card key={e.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {e.kind.replace("-", " ")}
                  </Badge>
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
                      {e.city}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" />
                      {e.attendeeCollectorIds.length} collectors flagged
                    </span>
                  </p>
                </div>
              </div>
              {e.attendeeCollectorIds.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {e.attendeeCollectorIds
                    .map((id) => getCollector(id))
                    .filter((c): c is NonNullable<typeof c> => !!c)
                    .map((c) => (
                      <span
                        key={c.id}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[11px]"
                      >
                        {c.name}
                      </span>
                    ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
