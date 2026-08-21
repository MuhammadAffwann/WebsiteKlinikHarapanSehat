import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarCheck,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Newspaper,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutFn } from "@/lib/auth";

interface DashboardLayoutProps {
  children: ReactNode;
  userEmail?: string;
}

interface NavMenuItem {
  label: string;
  to?: "/dashboardpanel" | "/dashboardpanel/layanan" | "/dashboardpanel/blog";
  icon: typeof LayoutDashboard;
  disabled?: boolean;
  badge?: string;
}

const navMenuItems: NavMenuItem[] = [
  {
    label: "Dashboard",
    to: "/dashboardpanel",
    icon: LayoutDashboard,
  },
  {
    label: "Layanan",
    to: "/dashboardpanel/layanan",
    icon: Layers,
  },
  {
    label: "Dokter",
    to: "/dashboardpanel/dokter",
    icon: Stethoscope,
  },
  {
    label: "Blog & Edukasi",
    to: "/dashboardpanel/blog",
    icon: Newspaper,
  },
  {
    label: "Testimonial",
    to: "/dashboardpanel/testimonial",
    icon: MessageSquareQuote,
  },
  {
    label: "Pendaftaran",
    icon: CalendarCheck,
    disabled: true,
    badge: "Segera",
  },
];

export function DashboardLayout({ children, userEmail }: DashboardLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutFn();
    window.location.href = "/dashboardpanel/login";
  };

  const isCurrentActive = (to?: string) => {
    if (!to) return false;
    if (to === "/dashboardpanel") {
      return pathname === "/dashboardpanel" || pathname === "/dashboardpanel/";
    }
    return pathname.startsWith(to);
  };

  const renderNavList = (onItemClick?: () => void) => (
    <ul className="space-y-1.5 px-3 py-2">
      {navMenuItems.map((item) => {
        const Icon = item.icon;
        const active = isCurrentActive(item.to);

        if (item.disabled || !item.to) {
          return (
            <li key={item.label}>
              <div
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-muted-foreground/45 cursor-not-allowed select-none transition-colors"
                title="Modul belum tersedia (akan hadir pada step berikutnya)"
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-4 shrink-0 text-muted-foreground/40" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground/60">
                    {item.badge}
                  </span>
                )}
              </div>
            </li>
          );
        }

        return (
          <li key={item.label}>
            <Link
              to={item.to}
              onClick={onItemClick}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon
                className={`size-4 shrink-0 ${
                  active ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <div className="flex items-center gap-2.5">
          {/* Compact Logo Mark */}
          <div className="relative flex size-7 shrink-0 flex-col justify-between">
            <div className="absolute top-0 right-0 flex size-3.5 items-center justify-center rounded-[2px] bg-[#43a047] font-bold text-white shadow-xs">
              <span className="text-[9px] font-extrabold leading-none">S</span>
            </div>
            <div className="absolute bottom-0 left-0 flex size-3.5 items-center justify-center rounded-[2px] bg-[#0052cc] font-bold text-white shadow-xs">
              <span className="text-[9px] font-extrabold leading-none">H</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold leading-tight text-foreground">Harapan Sehat</div>
            <div className="text-[10px] text-primary font-semibold">Admin Panel</div>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="size-8 rounded-lg"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-card/95 backdrop-blur-md md:hidden">
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <div className="text-xs font-bold text-foreground">Menu Navigasi Admin</div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              className="size-8 rounded-lg"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {renderNavList(() => setIsMobileMenuOpen(false))}
          </div>

          <div className="border-t border-border p-4 space-y-3">
            {userEmail && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                <User className="size-3.5" />
                <span className="truncate font-medium text-foreground">{userEmail}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full gap-2 rounded-xl text-xs font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              <LogOut className="size-3.5" />
              Keluar
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar (Fixed 240px width) */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col justify-between border-r border-border bg-card sticky top-0 h-screen z-30 shadow-xs">
        <div>
          {/* Sidebar Header */}
          <div className="flex h-16 items-center gap-3 border-b border-border px-5">
            {/* Mark: Green S box & Blue H box */}
            <div className="relative flex size-8 shrink-0 flex-col justify-between">
              <div className="absolute top-0 right-0 flex size-4 items-center justify-center rounded-[3px] bg-[#43a047] font-bold text-white shadow-xs">
                <span className="text-[10px] font-extrabold leading-none">S</span>
              </div>
              <div className="absolute bottom-0 left-0 flex size-4 items-center justify-center rounded-[3px] bg-[#0052cc] font-bold text-white shadow-xs">
                <span className="text-[10px] font-extrabold leading-none">H</span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold leading-tight tracking-tight text-foreground truncate">
                Harapan Sehat
              </div>
              <div className="text-[11px] font-semibold text-primary">Admin Panel</div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="py-4">
            <div className="px-5 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Menu Utama
            </div>
            {renderNavList()}
          </div>
        </div>

        {/* Sidebar Footer / User Profile & Logout */}
        <div className="border-t border-border p-4 bg-muted/20 space-y-3">
          {userEmail && (
            <div className="flex items-center gap-2.5 rounded-xl bg-card border border-border/80 px-3 py-2 shadow-2xs">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-medium text-muted-foreground">Login sebagai</div>
                <div className="truncate text-xs font-semibold text-foreground" title={userEmail}>
                  {userEmail}
                </div>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full gap-2 rounded-xl text-xs font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            <LogOut className="size-3.5" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-x-hidden">{children}</div>
    </div>
  );
}
