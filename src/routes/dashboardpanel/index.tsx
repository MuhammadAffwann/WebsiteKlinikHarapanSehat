import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useId } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
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
  type: "layanan" | "blog";
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

type StatsType = {
  servicesCount: number;
  doctorsCount: number;
  postsCount: number;
  pageViewsCount: number;
  recentActivity: ActivityItem[];
  recentItems: RecentItem[];
};

/* ─── Main Dashboard Page ─── */
function DashboardIndexPage() {
  const { session } = Route.useRouteContext();
  const { stats: initialStats } = Route.useLoaderData();
  const [stats, setStats] = useState<StatsType>(initialStats);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBarIndex, setActiveBarIndex] = useState(3); // Default highlighted day (Kamis)

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
        
        {/* ─── Top Header Bar (Search & User Profile) ─── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari modul, layanan, atau artikel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-full border border-border/80 bg-card text-sm text-foreground placeholder:text-muted-foreground/60 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* User & Notifications */}
          <div className="flex items-center justify-end gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-10 rounded-full px-3.5 text-xs font-medium border-border/80 shadow-xs gap-1.5 hover:bg-muted/80"
              title="Perbarui Data"
            >
              <RefreshCw className={`size-3.5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            {/* Notification Icon */}
            <button className="relative flex size-10 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground shadow-xs hover:bg-muted/80 transition-colors">
              <Bell className="size-4" />
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-xs">
                3
              </span>
            </button>

            {/* Admin Profile */}
            <div className="flex items-center gap-2.5 rounded-full border border-border/80 bg-card py-1.5 pl-2 pr-4 shadow-xs">
              <div className="flex size-7 items-center justify-center rounded-full bg-emerald-600 text-white font-semibold text-xs shadow-xs">
                {session.user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-foreground leading-tight">
                  Admin Harapan Sehat
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {session.user?.email || "admin@harapansehat.com"}
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

        {/* ─── Row 2: Middle Section (Chart + Promo/Info Card) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Chart: Grafik Pengunjung Harian (8 cols) */}
          <div className="lg:col-span-8 rounded-3xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs flex flex-col justify-between">
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
              <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-52 px-2 sm:px-6">
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
                        className={`w-full max-w-[48px] rounded-2xl transition-all duration-300 ${
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

          {/* Right Card: Feature / Promo Banner (4 cols) */}
          <div className="lg:col-span-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-7 shadow-md flex flex-col justify-between">
            {/* Background glowing circles */}
            <div className="absolute -top-16 -right-16 size-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold tracking-wider uppercase backdrop-blur-md">
                <Sparkles className="size-3 text-yellow-300" />
                PANEL HARAPAN SEHAT
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-black leading-snug tracking-tight">
                Kelola Konten & Layanan Klinik
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Tambahkan info poli baru, perbarui artikel kesehatan masyarakat, atau cek antrean pasien dengan cepat.
              </p>
            </div>

            {/* CTA Button */}
            <div className="relative z-10 pt-6">
              <Button
                asChild
                className="w-full h-11 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition-transform active:scale-98"
              >
                <Link to="/dashboardpanel/layanan">
                  <Plus className="mr-1.5 size-4 stroke-[2.5]" /> Tambah Layanan Baru
                </Link>
              </Button>
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
