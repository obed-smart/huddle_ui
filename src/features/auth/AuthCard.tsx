import Link from "next/link";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md animate-(--animate-slide-up) space-y-7">
      <Link href="/" className="flex items-center gap-2.5 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-(--radius-sm)">
        <div className="flex size-9 items-center justify-center rounded-(--radius-sm) bg-primary font-heading text-lg font-bold text-primary-foreground">
          H
        </div>
        <span className="font-heading text-xl font-semibold text-foreground">Huddle</span>
      </Link>

      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {children}

      <p className="text-center text-sm text-muted-foreground">
        {footerText}{" "}
        <Link href={footerLinkHref} className="font-medium text-primary hover:underline">
          {footerLinkText}
        </Link>
      </p>
    </div>
  );
}
