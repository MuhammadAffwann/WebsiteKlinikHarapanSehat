import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo, useRef, useId } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Heart,
  HelpCircle,
  Layers,
  Newspaper,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getSessionFn } from "@/lib/auth";
import { getDashboardStatsFn } from "@/lib/dashboard";

export const Route = createFileRoute("/dashboardpanel/")({
  head: () => ({
    meta: [{ title: "Dashboard Admin — Klinik Harapan Sehat" }],
  }),
  beforeLoad: async () => {
    const session = await getSessionFn();
    if (!session.isAuthenticated || !session.user) {
      throw redirect({
        to: "/dashboardpanel/login",
      });
    }
    return { session };
  },
  loader: async () => {
    const stats = await getDashboardStatsFn();
    return { stats };
  },
  component: DashboardIndexPage,
});

/* ─── Relative time helper ─── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.max(0, Math.floor(diff / 1000));
  if (seconds < 60) return "Baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}h lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}bln lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

type ActivityItem = {
  id: string;
  type: string;
  action: string;
  title: string;
  createdAt: string;
  author: string;
};

type RecentItem = {
  id: string;
  title: string;
  type: string;
  category: string;
  date: string;
  status: string;
  statusColor: string;
  href: string;
};

type StatsType = Awaited<ReturnType<typeof getDashboardStatsFn>>;

/* ─── Main Dashboard Page ─── */
function DashboardIndexPage() {
  const { session } = Route.useRouteContext();
  const { stats: initialStats } = Route.useLoaderData();
  const [stats, setStats] = useState<StatsType>(initialStats);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeBarIndex, setActiveBarIndex] = useState(3); // Default highlighted day (Kamis)
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live real-time clock updater
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const freshStats = await getDashboardStatsFn();
      setStats(freshStats);
    } catch {
      // ignore error
    }
    setRefreshing(false);
  }, []);

  // Filter search items
  const query = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!query) return [];
    return (stats.searchItems || []).filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchSubtitle = item.subtitle.toLowerCase().includes(query);
      const matchType = item.type.toLowerCase().includes(query);
      return matchTitle || matchSubtitle || matchType;
    });
  }, [query, stats.searchItems]);

  // Click outside listener to close search dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Daily visitors chart simulation mapped to total visits
  const baseCount = Math.max(1, stats.pageViewsCount);
  const chartDays = [
    { day: "Sen", value: Math.max(4, Math.round(baseCount * 0.18)), fullDay: "Senin" },
    { day: "Sel", value: Math.max(6, Math.round(baseCount * 0.28)), fullDay: "Selasa" },
    { day: "Rab", value: Math.max(5, Math.round(baseCount * 0.22)), fullDay: "Rabu" },
    { day: "Kam", value: Math.max(12, Math.round(baseCount * 0.45) + 8), fullDay: "Kamis (Hari Ini)" },
    { day: "Jum", value: Math.max(8, Math.round(baseCount * 0.35)), fullDay: "Jumat" },
    { day: "Sab", value: Math.max(7, Math.round(baseCount * 0.26)), fullDay: "Sabtu" },
    { day: "Min", value: Math.max(3, Math.round(baseCount * 0.15)), fullDay: "Minggu" },
  ];

  const maxChartValue = Math.max(...chartDays.map((d) => d.value), 20);

  return (
    <DashboardLayout userEmail={session.user?.email}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* ─── Top Header Bar (Search, Refresh & User Profile) ─── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Bar & Refresh Button */}
          <div className="flex items-center gap-2.5 flex-1 max-w-xl">
            <div ref={searchContainerRef} className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari modul, layanan, dokter, artikel..."
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchFocused(false);
                  }
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                className="w-full h-10 pl-10 pr-9 rounded-full border border-border/80 bg-card text-sm text-foreground placeholder:text-muted-foreground/60 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchFocused(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/80 transition-colors"
                  title="Hapus pencarian"
                >
                  <X className="size-3.5" />
                </button>
              )}

              {/* ─── Live Search Floating Results Dropdown ─── */}
              {searchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 top-full mt-2 w-full sm:w-[500px] z-50 rounded-2xl border border-border bg-card/95 backdrop-blur-md p-2 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 text-xs text-muted-foreground font-medium">
                    <span>Hasil Pencarian ({searchResults.length})</span>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">Tekan ESC untuk tutup</span>
                  </div>

                  <div className="max-h-[340px] overflow-y-auto p-1 space-y-1">
                    {searchResults.length > 0 ? (
                      searchResults.map((item) => {
                        const Icon =
                          item.type === "Layanan"
                            ? Layers
                            : item.type === "Dokter"
                              ? Stethoscope
                              : item.type === "Blog"
                                ? Newspaper
                                : item.type === "Testimoni"
                                  ? Heart
                                  : item.type === "Pendaftaran"
                                    ? Users
                                    : ArrowRight;

                        const typeBadgeColor =
                          item.type === "Layanan"
                            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                            : item.type === "Dokter"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : item.type === "Blog"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                : item.type === "Testimoni"
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                  : item.type === "Pendaftaran"
                                    ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                                    : "bg-muted text-muted-foreground border border-border";

                        return (
                          <Link
                            key={item.id}
                            to={item.href}
                            onClick={() => {
                              setSearchFocused(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-accent/80 group"
                          >
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <Icon className="size-4" />
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                  {item.title}
                                </p>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${typeBadgeColor}`}>
                                  {item.type}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            </div>
                            <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                          </Link>
                        );
                      })
                    ) : (
                      <div className="py-7 text-center">
                        <Search className="size-7 mx-auto text-muted-foreground/40 mb-2" />
                        <p className="text-xs font-semibold text-foreground">Tidak ditemukan hasil</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Tidak ada data yang cocok dengan "{searchQuery}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button - Moved next to Search Bar */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-10 rounded-full px-3.5 text-xs font-medium border-border/80 shadow-xs gap-1.5 hover:bg-muted/80 shrink-0"
              title="Perbarui Data"
            >
              <RefreshCw className={`size-3.5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>

          {/* Real-time Clock Widget */}
          <div className="flex items-center justify-end gap-3 shrink-0">
            <div className="flex items-center gap-2.5 rounded-full border border-border/80 bg-card py-1.5 pl-2.5 pr-4 shadow-xs">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="size-4 animate-pulse" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-foreground font-mono tracking-tight leading-tight">
                  {currentTime
                    ? currentTime.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }) + " WIB"
                    : "--:--:-- WIB"}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {currentTime
                    ? currentTime.toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Memuat waktu..."}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Row 1: Top 4 Stat Cards (Modern Horizontal Bar) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Layanan */}
          <Link
            to="/dashboardpanel/layanan"
            className="group relative flex items-center justify-between p-5 rounded-2xl border border-border/70 bg-card shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-full bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 group-hover:scale-105 transition-transform">
                <Layers className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Layanan</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black tracking-tight text-foreground tabular-nums">
                    {stats.servicesCount}
                  </span>
                  <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                    +{stats.servicesCount}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* 2. Jumlah Dokter */}
          <Link
            to="/dashboardpanel/dokter"
            className="group relative flex items-center justify-between p-5 rounded-2xl border border-border/70 bg-card shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Stethoscope className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Jumlah Dokter</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black tracking-tight text-foreground tabular-nums">
                    {stats.doctorsCount}
                  </span>
                  <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                    +{stats.doctorsCount}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* 3. Blog & Edukasi */}
          <Link
            to="/dashboardpanel/blog"
            className="group relative flex items-center justify-between p-5 rounded-2xl border border-border/70 bg-card shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <Newspaper className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Artikel Blog</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black tracking-tight text-foreground tabular-nums">
                    {stats.postsCount}
                  </span>
                  <span className="inline-flex items-center text-[11px] font-semibold text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded-md">
                    +{stats.postsCount}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* 4. Total Kunjungan */}
          <div className="relative flex items-center justify-between p-5 rounded-2xl border border-border/70 bg-card shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-full bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                <Eye className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Kunjungan</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black tracking-tight text-foreground tabular-nums">
                    {stats.pageViewsCount.toLocaleString("id-ID")}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-semibold text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Row 2: Full-width Visitor Chart ─── */}
        <div className="w-full rounded-3xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          {/* Chart Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Grafik Pengunjung Harian
              </p>
              <div className="flex items-baseline gap-3 mt-1">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {stats.pageViewsCount.toLocaleString("id-ID")}
                  <span className="text-sm font-normal text-muted-foreground ml-1.5">Kunjungan</span>
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <TrendingUp className="size-3" /> +14% minggu ini
                </span>
              </div>
            </div>

            {/* Day filter/badge */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs font-medium text-muted-foreground">
              <span className="px-2.5 py-1 rounded-lg bg-card text-foreground font-semibold shadow-2xs">
                7 Hari Terakhir
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="relative pt-12 pb-2">
            <div className="flex items-end justify-between gap-3 sm:gap-6 md:gap-8 h-48 sm:h-56 px-2 sm:px-8 md:px-12">
              {chartDays.map((item, idx) => {
                const heightPercent = Math.max(15, Math.round((item.value / maxChartValue) * 100));
                const isSelected = activeBarIndex === idx;

                return (
                  <div
                    key={item.day}
                    onClick={() => setActiveBarIndex(idx)}
                    className="group relative flex-1 flex flex-col items-center cursor-pointer h-full justify-end"
                  >
                    {/* Interactive Tooltip on active bar */}
                    {isSelected && (
                      <div className="absolute -top-11 z-20 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
                        <div className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1 text-xs font-bold shadow-lg tabular-nums whitespace-nowrap">
                          {item.value} Kunjungan
                        </div>
                        <div className="size-2 bg-slate-900 dark:bg-slate-100 rotate-45 -mt-1" />
                      </div>
                    )}

                    {/* Bar Pillar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[64px] rounded-2xl transition-all duration-300 ${
                        isSelected
                          ? "bg-blue-600 dark:bg-blue-500 shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40"
                          : "bg-muted/80 group-hover:bg-muted-foreground/20"
                      }`}
                    />

                    {/* Day Label */}
                    <span
                      className={`mt-3 text-xs font-semibold transition-colors ${
                        isSelected ? "text-foreground font-bold" : "text-muted-foreground/70 group-hover:text-foreground"
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Row 3: Bottom Section (Activities + Recent Table) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Activities (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-border/70 bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-foreground">Aktivitas Terbaru</h3>
                <p className="text-xs text-muted-foreground">Riwayat perubahan data & postingan</p>
              </div>
              <Clock className="size-4 text-muted-foreground" />
            </div>

            {stats.recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-4 text-center">
                Belum ada aktivitas tercatat.
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.map((act) => {
                  const isLayanan = act.type === "layanan";
                  return (
                    <div key={act.id} className="flex items-start gap-3 group">
                      {/* Avatar / Icon Circle */}
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-xs ${
                          isLayanan
                            ? "bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
                            : "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                        }`}
                      >
                        {isLayanan ? <Layers className="size-4" /> : <Newspaper className="size-4" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground leading-snug">
                          {act.author}{" "}
                          <span className="font-normal text-muted-foreground">
                            {act.action}{" "}
                            <span className="font-medium text-foreground">"{act.title}"</span>
                          </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5 tabular-nums">
                          {timeAgo(act.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Recent Invoices / Data Table (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-border/70 bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Daftar Konten Terkini</h3>
                <p className="text-xs text-muted-foreground">Layanan dan artikel yang baru ditambahkan</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-semibold rounded-xl text-primary">
                <Link to="/dashboardpanel/layanan">
                  Lihat Semua <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 text-muted-foreground font-semibold">
                    <th className="pb-3 pr-4">Judul Item</th>
                    <th className="pb-3 px-3">Tipe</th>
                    <th className="pb-3 px-3">Kategori/Badge</th>
                    <th className="pb-3 px-3">Tanggal</th>
                    <th className="pb-3 pl-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {stats.recentItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground italic">
                        Belum ada konten dibuat.
                      </td>
                    </tr>
                  ) : (
                    stats.recentItems.map((item) => (
                      <tr key={item.id} className="group hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 pr-4">
                          <Link
                            to={item.href}
                            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.title}
                          </Link>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              item.type === "Layanan"
                                ? "bg-orange-500/10 text-orange-700 dark:text-orange-400"
                                : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-muted-foreground font-medium">
                          {item.category}
                        </td>
                        <td className="py-3.5 px-3 text-muted-foreground/80 tabular-nums">
                          {timeAgo(item.date)}
                        </td>
                        <td className="py-3.5 pl-3 text-right">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              item.statusColor === "emerald"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                : item.statusColor === "blue"
                                ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
