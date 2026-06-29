import { Button, type ButtonProps } from "@/components/ui/button";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.04 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.19a5.3 5.3 0 0 1-2.3 3.48v2.89h3.71c2.17-2 3.44-4.93 3.44-8.61Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.71-2.89c-1.03.7-2.36 1.11-3.57 1.11-2.75 0-5.08-1.86-5.91-4.36H2.27v2.98A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M6.09 14.2A6.6 6.6 0 0 1 5.75 12c0-.76.13-1.5.34-2.2V6.82H2.27A11 11 0 0 0 1 12c0 1.78.43 3.46 1.27 4.98l3.82-2.78Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.45c1.62 0 3.06.56 4.21 1.64l3.29-3.29A10.95 10.95 0 0 0 12 1 11 11 0 0 0 2.27 6.82l3.82 2.98c.83-2.5 3.16-4.35 5.91-4.35Z"
      />
    </svg>
  );
}

export function GoogleButton(props: ButtonProps) {
  return (
    <Button type="button" variant="outline" size="lg" className="w-full" {...props}>
      <GoogleMark />
      Continue with Google
    </Button>
  );
}
