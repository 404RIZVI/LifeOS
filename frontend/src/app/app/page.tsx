"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError, type Task } from "@/lib/api";

interface Profile {
  full_name: string | null;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [profileRes, taskRes] = await Promise.all([
          api.get<Profile>("/profile/"),
          api.get<{ items: Task[] }>(
            "/tasks?view=today&page_size=10"
          ),
        ]);

        if (!cancelled) {
          setProfile(profileRes);
          setTasks(taskRes.items);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Failed to load dashboard."
          );
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    await api.post("/auth/logout");
    router.push("/");
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  const greetingName =
    profile.full_name?.split(" ")[0] ||
    profile.email.split("@")[0];

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/app" className="font-semibold">
            LifeOS
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/app/settings"
              className="text-muted hover:text-foreground transition-colors"
            >
              Settings
            </Link>

            <button
              onClick={handleLogout}
              className="text-muted hover:text-foreground transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold">
          Good day, {greetingName}
        </h1>

        <p className="mt-1 text-muted">
          {tasks && tasks.length > 0
            ? `You have ${tasks.length} task${
                tasks.length === 1 ? "" : "s"
              } due today.`
            : "Nothing due today — you're clear."}
        </p>

        <section className="mt-8">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wide">
            Today
          </h2>

          <div className="mt-3 divide-y divide-border border border-border rounded-lg bg-surface">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <span>{task.title}</span>

                  <span className="text-xs text-muted uppercase">
                    {task.priority}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-muted text-sm">
                No tasks due today.
              </div>
            )}
          </div>
        </section>

        <section className="mt-10">
          <div>
            <h2 className="text-lg font-semibold">
              Your LifeOS
            </h2>

            <p className="mt-1 text-sm text-muted">
              Manage different parts of your life from one place.
            </p>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* AI Assistant */}
            <Link
              href="/app/assistant"
              className="group border border-violet-500/30 rounded-lg p-6 bg-surface hover:border-violet-400 hover:shadow-sm transition-all"
            >
              <div className="text-2xl text-violet-400">
                ✦
              </div>

              <h3 className="mt-4 font-medium text-violet-300 group-hover:text-violet-200 transition-colors">
                LifeOS AI
              </h3>

              <p className="mt-1 text-sm text-muted">
                Your personal AI assistant for planning,
                organizing and managing LifeOS.
              </p>

              <div className="mt-4 text-xs text-violet-400">
                Open AI Assistant →
              </div>
            </Link>

            {/* Tasks */}
            <Link
              href="/app/tasks"
              className="group border border-border rounded-lg p-6 bg-surface hover:border-primary hover:shadow-sm transition-all"
            >
              <div className="text-2xl">✓</div>

              <h3 className="mt-4 font-medium group-hover:text-primary transition-colors">
                Tasks
              </h3>

              <p className="mt-1 text-sm text-muted">
                Manage everything on your task list.
              </p>
            </Link>

            {/* Goals */}
            <Link
              href="/app/goals"
              className="group border border-border rounded-lg p-6 bg-surface hover:border-primary hover:shadow-sm transition-all"
            >
              <div className="text-2xl">🎯</div>

              <h3 className="mt-4 font-medium group-hover:text-primary transition-colors">
                Goals
              </h3>

              <p className="mt-1 text-sm text-muted">
                Set goals, track progress and achieve them.
              </p>
            </Link>

            {/* Habits */}
            <Link
              href="/app/habits"
              className="group border border-border rounded-lg p-6 bg-surface hover:border-primary hover:shadow-sm transition-all"
            >
              <div className="text-2xl">↻</div>

              <h3 className="mt-4 font-medium group-hover:text-primary transition-colors">
                Habits
              </h3>

              <p className="mt-1 text-sm text-muted">
                Build consistency, track streaks and improve every day.
              </p>
            </Link>

            {/* Calendar */}
            <Link
              href="/app/calendar"
              className="group border border-border rounded-lg p-6 bg-surface hover:border-primary hover:shadow-sm transition-all"
            >
              <div className="text-2xl">📅</div>

              <h3 className="mt-4 font-medium group-hover:text-primary transition-colors">
                Calendar
              </h3>

              <p className="mt-1 text-sm text-muted">
                Plan your schedule and events.
              </p>
            </Link>

            {/* Notes */}
            <Link
              href="/app/notes"
              className="group border border-border rounded-lg p-6 bg-surface hover:border-primary hover:shadow-sm transition-all"
            >
              <div className="text-2xl">✎</div>

              <h3 className="mt-4 font-medium group-hover:text-primary transition-colors">
                Notes
              </h3>

              <p className="mt-1 text-sm text-muted">
                Capture ideas, thoughts and information.
              </p>
            </Link>

            {/* Finance */}
            <Link
              href="/app/finance"
              className="group border border-border rounded-lg p-6 bg-surface hover:border-primary hover:shadow-sm transition-all"
            >
              <div className="text-2xl">₹</div>

              <h3 className="mt-4 font-medium group-hover:text-primary transition-colors">
                Finance
              </h3>

              <p className="mt-1 text-sm text-muted">
                Track your money, spending and finances.
              </p>
            </Link>

          </div>
        </section>
      </main>
    </div>
  );
}