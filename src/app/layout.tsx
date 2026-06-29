import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Huddle — Chat, calls, and meetings in one place",
  description:
    "Huddle is a unified messaging, calling, and meeting workspace for teams.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <QueryProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              className:
                "rounded-(--radius-md) border border-border shadow-(--shadow-md)",
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
