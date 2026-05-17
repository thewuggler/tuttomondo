"use client";

import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { EmailThread, Nudge, Collector } from "@/lib/data/types";

export function DraftSheet({
  trigger,
  collector,
  thread,
  nudge,
}: {
  trigger: React.ReactElement;
  collector: Collector;
  thread?: EmailThread;
  nudge: Nudge;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSent(false);
      }}
    >
      <SheetTrigger render={trigger} />
      <SheetContent
        side="right"
        className="w-full max-w-xl gap-0 p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border/60 px-6 py-4">
          <SheetTitle className="font-display text-xl">
            Reply to {collector.name}
          </SheetTitle>
          <SheetDescription className="line-clamp-2">
            {nudge.suggestedSubject ?? thread?.subject}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100dvh-200px)]">
          <div className="space-y-5 p-6">
            {thread ? (
              <section>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Recent thread
                </p>
                <div className="mt-2 space-y-2.5">
                  {thread.messages.slice(-3).map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-md border border-border/60 p-3 text-sm ${
                        m.direction === "inbound" ? "bg-muted/40" : "bg-card"
                      }`}
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        {m.authorName} ·{" "}
                        {new Date(m.sentAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm">{m.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <Separator />

            <section>
              <div className="flex items-center gap-2">
                <Wand2 className="size-4 text-foreground" />
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Draft in your voice
                </p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Trained on your last 50 messages with {collector.name.split(" ")[0]}.
              </p>
              <div className="mt-3 space-y-2 rounded-lg border border-foreground/15 bg-card p-4 shadow-sm">
                {nudge.suggestedSubject ? (
                  <p className="border-b border-border/60 pb-2 text-sm font-medium">
                    {nudge.suggestedSubject}
                  </p>
                ) : null}
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {nudge.suggestedDraft}
                </p>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="size-3" />
                Grounded in: 3 prior threads, last 2 purchases, important dates
              </p>
            </section>
          </div>
        </ScrollArea>

        <footer className="border-t border-border/60 bg-background px-6 py-4">
          {sent ? (
            <p className="text-center text-sm font-medium text-emerald-700">
              Sent. Logged to {collector.name}'s timeline.
            </p>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Edit before sending
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setSent(true);
                  setTimeout(() => setOpen(false), 1100);
                }}
              >
                Send draft
              </Button>
            </div>
          )}
        </footer>
      </SheetContent>
    </Sheet>
  );
}
