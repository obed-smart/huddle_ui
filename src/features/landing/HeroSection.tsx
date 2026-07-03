import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
      <div className="space-y-6">
        <h1 className="font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          Chat, call, and meet — without the chaos.
        </h1>

        <p className="max-w-md text-base leading-relaxed text-muted-foreground">
          Huddle brings messaging, calls, and team meetings into one calm, connected workspace.
          Built for teams who move fast and want less friction.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button asChild size="lg">
            <Link href="/register">Get started — it&apos;s free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>

      <HeroPreview />
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-6 -z-10 rounded-(--radius-lg) bg-gradient-to-br from-violet-200 via-violet-100 to-transparent opacity-70 blur-2xl"
        aria-hidden="true"
      />
      <div className="space-y-3 rounded-(--radius-lg) border border-border bg-surface p-5 shadow-(--shadow-md)">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <Avatar name="Team Meet" size="sm" />
          <div>
            <p className="text-sm font-medium text-foreground">Team Meet</p>
            <p className="text-xs text-muted-foreground">6 members · 3 online</p>
          </div>
        </div>

        <div className="space-y-2.5 py-2">
          <ChatBubble
            name="Jakob Schleifer"
            text="Phase one starts now — research, alignment, deliverables."
          />
          <ChatBubble name="Hanna Lubin" text="😊" />
          <ChatBubble text="Sounds good, I'll send the timeline today." own />
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ name, text, own = false }: { name?: string; text: string; own?: boolean }) {
  return (
    <div className={cn("flex", own && "justify-end")}>
      <div
        className={cn(
          "max-w-[80%] rounded-(--radius-md) px-3.5 py-2 text-sm",
          own ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        )}
      >
        {name && !own && <p className="mb-0.5 text-[11px] font-medium opacity-70">{name}</p>}
        {text}
      </div>
    </div>
  );
}
