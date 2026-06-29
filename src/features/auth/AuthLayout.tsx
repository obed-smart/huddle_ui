import { Avatar } from "@/components/ui/avatar";
import { seedUsers } from "@/lib/seed-data";

const showcaseUsers = seedUsers.slice(1, 5);

function BrandPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-12 text-white lg:flex">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 35%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-(--radius-sm) bg-white/15 font-heading text-lg font-bold backdrop-blur-sm">
          H
        </div>
        <span className="font-heading text-xl font-semibold">Huddle</span>
      </div>

      <div className="relative max-w-md space-y-6">
        <p className="font-heading text-3xl font-semibold leading-tight">
          Chat, call, and meet — all in one connected workspace.
        </p>
        <p className="text-sm leading-relaxed text-indigo-100">
          Seamless messaging, crystal-clear calls, and effortless team meetings.
          Built for fast-moving teams who value clarity over clutter.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <div className="flex -space-x-2">
            {showcaseUsers.map((user) => (
              <Avatar
                key={user.id}
                name={user.name}
                size="md"
                presence={user.status === "online" ? "online" : undefined}
                pulse
                className="[&>span:first-child]:ring-indigo-500"
              />
            ))}
          </div>
          <p className="text-xs text-indigo-100">
            Joined by <span className="font-semibold text-white">2,400+</span> teams this month
          </p>
        </div>
      </div>

      <p className="relative text-xs text-indigo-200">© {new Date().getFullYear()} Huddle. All rights reserved.</p>
    </div>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />
      <div className="flex items-center justify-center bg-background p-6 sm:p-10">{children}</div>
    </div>
  );
}
