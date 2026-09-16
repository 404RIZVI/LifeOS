"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError, type User } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await api.post<User>("/auth/login", {
        email,
        password,
      });

      router.push("/app");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
          >
            <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white text-xl font-bold">
                L
              </span>
            </div>

            <span className="text-2xl font-bold tracking-tight text-foreground">
              LifeOS
            </span>
          </Link>

          <p className="mt-3 text-sm text-muted">
            Your personal operating system
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface p-7 shadow-2xl">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-muted">
              Log in to continue to your LifeOS.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>

                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-16 text-sm text-foreground outline-none transition-all placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500"
              >
                {error}
              </div>
            )}

            {/* Login */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Logging in...
                </span>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />

            <span className="text-xs text-muted">
              New to LifeOS?
            </span>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Register */}
          <Link
            href="/auth/register"
            className="flex w-full items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-background hover:border-primary/50"
          >
            Create an account
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted">
          By continuing, you agree to use LifeOS responsibly.
        </p>

        <div className="mt-4 flex justify-center gap-4 text-xs text-muted">
          <Link
            href="/"
            className="hover:text-foreground transition-colors"
          >
            LifeOS
          </Link>

          <span>•</span>

          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </Link>

          <span>•</span>

          <Link
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            Terms
          </Link>
        </div>

      </div>
    </main>
  );
}