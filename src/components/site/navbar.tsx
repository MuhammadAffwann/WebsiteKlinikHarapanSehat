import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ArrowRight } from "lucide-react";

import { BrandLogo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";

type NavItem = {
  label: string;
  to: "/" | "/dokter" | "/layanan" | "/blog" | "/daftar-online";
  hash?: string;
};

const navItems: NavItem[] = [
  { label: "Home", to: "/", hash: "atas" },
  { label: "About", to: "/", hash: "about" },
  { label: "Cari Dokter", to: "/dokter" },
  { label: "Layanan", to: "/", hash: "layanan" },
  { label: "Blog", to: "/", hash: "blog" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center py-1" onClick={() => setOpen(false)}>
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              {...(item.hash ? { hash: item.hash } : {})}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden rounded-full sm:inline-flex">
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
          <Button asChild className="mt-3 w-full rounded-full">
            <Link to="/" hash="kontak" onClick={() => setOpen(false)}>
              Hubungi Kami
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
