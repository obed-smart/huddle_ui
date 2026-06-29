import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-(--radius-sm) bg-primary font-heading text-lg font-bold text-primary-foreground">
            H
          </div>
          <span className="font-heading text-xl font-semibold text-foreground">Huddle</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
