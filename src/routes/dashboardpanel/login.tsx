import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/site/logo";
import { getSessionFn, loginFn } from "@/lib/auth";

export const Route = createFileRoute("/dashboardpanel/login")({
  head: () => ({
    meta: [{ title: "Login Admin — Klinik Harapan Sehat" }],
  }),
  beforeLoad: async () => {
    const session = await getSessionFn();
    if (session.isAuthenticated) {
      throw redirect({
        to: "/dashboardpanel",
      });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await loginFn({
        data: { email, password },
      });

      if (!res.success) {
        setError(res.error || "Gagal masuk. Periksa kembali email dan password Anda.");
        setIsLoading(false);
        return;
      }

      // Full page navigation so the browser sends the new httpOnly cookie
      window.location.href = "/dashboardpanel";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan pada server.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="text-center">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            Admin Panel Login
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Masuk untuk mengelola sistem Klinik Harapan Sehat
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email Admin
            </label>
            <div className="relative mt-1.5 rounded-md shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="size-4 text-muted-foreground" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukan Email"
                className="block w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Kata Sandi
            </label>
            <div className="relative mt-1.5 rounded-md shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="size-4 text-muted-foreground" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl py-2.5 font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk ke Dashboard"
            )}
          </Button>
        </form>

        <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
          Protected Administrator Portal &bull; Harapan Sehat
        </div>
      </div>
    </div>
  );
}
