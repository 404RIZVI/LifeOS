"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

interface Profile {
  full_name: string | null;
  email: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.get<Profile>("/profile/");
        setProfile(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = "/auth/login";
          return;
        }

        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load settings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } finally {
      window.location.href = "/";
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/app" className="font-semibold">
            LifeOS
          </Link>

          <Link
            href="/app"
            className="text-sm text-muted hover:text-foreground"
          >
            ? Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold">Settings</h1>

        <p className="mt-1 text-sm text-muted">
          Manage your LifeOS account.
        </p>

        <section className="mt-8 border border-border rounded-lg bg-surface p-6">
          <h2 className="text-lg font-medium">Profile</h2>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-sm text-muted">Name</p>
              <p className="mt-1 font-medium">
                {profile?.full_name || "Not set"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted">Email</p>
              <p className="mt-1 font-medium">
                {profile?.email}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 border border-border rounded-lg bg-surface p-6">
          <h2 className="text-lg font-medium">Account</h2>

          <p className="mt-1 text-sm text-muted">
            Sign out of your LifeOS account.
          </p>

          <button
            onClick={handleLogout}
            className="mt-5 border border-red-500/50 text-red-500 rounded-md px-4 py-2 text-sm hover:bg-red-500/10 transition-colors"
          >
            Log out
          </button>
        </section>
      </main>
    </div>
  );
}
