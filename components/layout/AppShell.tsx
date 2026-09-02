"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Users,
  ShieldCheck,
  Clapperboard,
  Settings as SettingsIcon,
  Plus,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  Radio,
  Search,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import type { Profile } from "@/lib/types";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookings", label: "Bookings", icon: BookOpen },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/people", label: "People", icon: Users },
  { href: "/users", label: "Users", icon: ShieldCheck },
  { href: "/programs", label: "Programs", icon: Clapperboard },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ user, children }: { user: Profile; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as "dark" | "light") || "dark";
    setTheme(stored);
    document.documentElement.classList.toggle("light", stored === "light");
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("light", next === "light");
  }

  async function signOutUser() {
    setSigningOut(true);
    try {
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  const Sidebar = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary-fg shadow-[0_4px_14px_-4px_rgb(var(--primary)/0.5)]">
          <span className="text-sm font-bold leading-none text-white">S7</span>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-fg">SAT<span className="text-accent">-7</span></p>
          <p className="text-[11px] text-muted">Production Booking</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNav}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative",
                active
                  ? "bg-surface-2 text-fg"
                  : "text-muted hover:bg-surface-2/60 hover:text-fg",
              )}
            >
              <Icon
                size={18}
                className={cn(active ? "text-accent" : "text-muted-2 group-hover:text-fg")}
              />
              {item.label}
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-3 flex items-center gap-2.5 rounded-lg px-2 py-1.5">
        <Avatar name={user.full_name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-fg">
            {user.full_name || user.email}
          </p>
          <p className="truncate text-[11px] text-muted">{user.role}</p>
        </div>
        <button
          onClick={signOutUser}
          disabled={signingOut}
          className="rounded-lg p-1.5 text-muted-2 hover:bg-surface-2 hover:text-danger"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-[rgb(var(--border))] bg-[#0a0a0a] lg:block">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-[rgb(var(--border))] bg-[#0a0a0a]">
            <button
              className="absolute right-3 top-4 text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <Sidebar onNav={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-surface/50 px-4 py-3 backdrop-blur-xl">
          <button
            className="rounded-lg p-2 text-muted-2 hover:bg-surface-2 hover:text-fg lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div className="flex flex-1 items-center gap-2">
            <Search
              size={16}
              className="text-muted-2"
            />
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted-2 hover:bg-surface-2 hover:text-fg"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
