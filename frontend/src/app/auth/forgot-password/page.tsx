"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post("/auth/password-reset/request", {
        email,
      });

      setMessage(
        "If an account exists with this email, password reset instructions have been sent."
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="border border-border rounded-lg bg-surface p-8">
          <Link
            href="/auth/login"
            className="text-sm text-muted hover:text-foreground"
          >
            ? Back to login
          </Link>

          <h1 className="mt-6 text-2xl font-semibold">
            Forgot your password?
          </h1>

          <p className="mt-2 text-sm text-muted">
            Enter your email address and we&apos;ll help you reset your
            password.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            {message && (
              <p className="text-sm text-green-600">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send reset instructions"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-foreground hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
