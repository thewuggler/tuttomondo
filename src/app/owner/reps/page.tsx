import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  formatMoney,
  getCollectorsForRep,
  getRepHealth,
  reps,
} from "@/lib/data";

export default function RepsIndexPage() {
  const team = reps;

  return (
    <div className="space-y-6 px-4 py-6 md:px-0 md:py-0">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Team
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {team.length} people on the floor
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Click any rep to drop into their daily view.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {team.map((rep) => {
          const owned = getCollectorsForRep(rep.id);
          const lifetime = owned.reduce((acc, c) => acc + c.lifetimeSpendCents, 0);
          const health =
            rep.role === "owner" || rep.role === "assistant"
              ? null
              : getRepHealth(rep.id);
          return (
            <Link key={rep.id} href={`/rep/${rep.id}`} className="group block">
              <Card className="transition group-hover:border-foreground/40 group-hover:shadow-sm">
                <CardHeader className="flex flex-row items-start gap-3 pb-3">
                  <Avatar className="size-11">
                    <AvatarFallback className="bg-secondary text-sm font-medium">
                      {rep.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base">{rep.name}</CardTitle>
                    <CardDescription>{rep.title}</CardDescription>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {rep.bio ? (
                    <p className="text-xs leading-snug text-muted-foreground">
                      {rep.bio}
                    </p>
                  ) : null}
                  <Separator />
                  <div className="grid grid-cols-3 gap-3">
                    <Metric label="Collectors" value={owned.length.toString()} />
                    <Metric label="Book lifetime" value={formatMoney(lifetime)} small />
                    {health ? (
                      <Metric
                        label="Needs reply"
                        value={health.needsReplyCount.toString()}
                        tone={health.needsReplyCount > 1 ? "warn" : "ok"}
                      />
                    ) : (
                      <Metric label="Role" value={cap(rep.role)} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
  small,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
  small?: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-0.5 font-medium tabular-nums ${small ? "text-sm" : ""} ${
          tone === "warn" ? "text-amber-700" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
