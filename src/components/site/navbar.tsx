import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ArrowRight, CalendarCheck } from "lucide-react";

import { BrandLogo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";

type NavItem = {
  label: string;
  to: "/" | "/dokter" | "/layanan" | "/blog" | "/daftar-online";
  hash?: string;
};

const navItems: NavItem[] = [
  { label: "Home", to: "/", hash: "atas" },
  { label: "Tentang Kami", to: "/", hash: "about" },
  { label: "Layanan", to: "/", hash: "layanan" },
  { label: "Cari Dokter", to: "/dokter" },
  { label: "Ijab Kabul", to: "/", hash: "ijab-kabul" },
  { label: "Blog", to: "/blog" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">


      {/* Main Navbar */}
      <div className="border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: Brand Logo */}
          <Link to="/" className="flex shrink-0 items-center py-1" onClick={() => setOpen(false)}>
            <BrandLogo />
          </Link>

          {/* Center: Nav Links distributed evenly across available space */}
          <nav className="hidden flex-1 items-center justify-center gap-6 lg:gap-8 xl:gap-10 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                {...(item.hash ? { hash: item.hash } : {})}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Action button */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Button asChild size="sm" className="hidden rounded-full font-semibold sm:inline-flex">
              <Link to="/" hash="kontak">
                Hubungi Kami <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full md:hidden"
              aria-label={open ? "Tutup menu" : "Buka menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  {...(item.hash ? { hash: item.hash } : {})}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link to="/daftar-online" onClick={() => setOpen(false)}>
                <CalendarCheck className="size-4 text-primary" /> Daftar Online
              </Link>
            </Button>
            <Button asChild className="w-full rounded-full">
              <Link to="/" hash="kontak" onClick={() => setOpen(false)}>
                Hubungi Kami <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
