import { MessagesSquare, ShieldCheck, Users, Video } from "@/components/ui/icons";

const FEATURES = [
  {
    icon: MessagesSquare,
    title: "Real-time messaging",
    description: "Typing indicators, read receipts, and rich attachments that feel instant.",
  },
  {
    icon: Video,
    title: "Calls & meetings",
    description: "Crystal-clear 1:1 calls and team meetings with screen sharing built in.",
  },
  {
    icon: Users,
    title: "Live presence",
    description: "See who's online, away, or in a meeting — always accurate, never stale.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    description: "Your conversations stay private, with security built into every layer.",
  },
];

export function FeaturesSection() {
  return (
    <section className="border-t border-border bg-surface/50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl space-y-2">
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Everything your team needs, nothing it doesn&apos;t
          </h2>
          <p className="text-sm text-muted-foreground">
            One workspace for the conversations, calls, and meetings that keep your team moving.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="space-y-3 rounded-(--radius-lg) border border-border bg-surface p-5"
            >
              <div className="flex size-10 items-center justify-center rounded-(--radius-md) bg-secondary text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
