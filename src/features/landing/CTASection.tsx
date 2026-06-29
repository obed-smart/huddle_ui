import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
        <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Ready to bring your team together?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Create your workspace in minutes. No credit card required.
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild size="lg">
            <Link href="/register">Get started — it&apos;s free</Link>
          </Button>
        </div>
      </div>

      <footer className="border-t border-border py-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Huddle. All rights reserved.
        </p>
      </footer>
    </section>
  );
}
