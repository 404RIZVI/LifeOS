"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

interface Habit {
  id: string;
  name: string;
  description: string | null;
  frequency: "daily" | "weekly";
  target_per_week: number;
  current_streak: number;
  best_streak: number;
  last_completed_date: string | null;
  is_active: boolean;
  start_date: string | null;
  created_at: string;
  updated_at: string;
}

interface HabitResponse {
  items: Habit[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function HabitsPage() {
  const router = useRouter();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [targetPerWeek, setTargetPerWeek] = useState(7);
  const [startDate, setStartDate] = useState("");

  async function loadHabits() {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<HabitResponse>(
        "/habits?active_only=true&page_size=100"
      );

      setHabits(response.items);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/auth/login");
        return;
      }

      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load habits."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHabits();
  }, []);

  async function handleCreateHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter a habit name.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await api.post<Habit>("/habits", {
        name: name.trim(),
        description: description.trim() || null,
        frequency,
        target_per_week: targetPerWeek,
        start_date: startDate || null,
      });

      setName("");
      setDescription("");
      setFrequency("daily");
      setTargetPerWeek(7);
      setStartDate("");

      await loadHabits();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to create habit."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete(id: string) {
    try {
      setError(null);

      await api.post<Habit>(`/habits/${id}/complete`);

      await loadHabits();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to complete habit."
      );
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this habit?"
    );

    if (!confirmed) return;

    try {
      setError(null);

      await api.delete<void>(`/habits/${id}`);

      await loadHabits();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to delete habit."
      );
    }
  }

  function isCompletedToday(habit: Habit) {
    if (!habit.last_completed_date) return false;

    const today = new Date().toISOString().split("T")[0];

    return habit.last_completed_date === today;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/app" className="font-semibold">
            LifeOS
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/app"
              className="text-muted hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>

            <Link
              href="/app/tasks"
              className="text-muted hover:text-foreground transition-colors"
            >
              Tasks
            </Link>

            <Link
              href="/app/goals"
              className="text-muted hover:text-foreground transition-colors"
            >
              Goals
            </Link>

            <Link
              href="/app/habits"
              className="text-foreground font-medium"
            >
              Habits
            </Link>

            <Link
              href="/app/settings"
              className="text-muted hover:text-foreground transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div>
          <h1 className="text-2xl font-semibold">Habits</h1>

          <p className="mt-1 text-muted">
            Build consistency, track your streaks and improve every day.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Create Habit */}
        <section className="mt-8 border border-border rounded-lg bg-surface p-6">
          <h2 className="font-medium">Create a new habit</h2>

          <form
            onSubmit={handleCreateHabit}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                Habit name
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Read for 30 minutes"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Optional description"
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-primary resize-none"
                maxLength={10000}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Frequency
                </label>

                <select
                  value={frequency}
                  onChange={(event) =>
                    setFrequency(
                      event.target.value as "daily" | "weekly"
                    )
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              {/* Target / week */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Target / week
                </label>

                <select
                  value={targetPerWeek}
                  onChange={(event) =>
                    setTargetPerWeek(Number(event.target.value))
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                    <option key={value} value={value}>
                      {value} {value === 1 ? "time" : "times"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create habit"}
            </button>
          </form>
        </section>

        {/* Habit List */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted uppercase tracking-wide">
              Your habits
            </h2>

            <span className="text-sm text-muted">
              {habits.length} habit
              {habits.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="mt-4 border border-border rounded-lg bg-surface px-6 py-10 text-center text-muted">
              Loading habits...
            </div>
          ) : habits.length === 0 ? (
            <div className="mt-4 border border-border rounded-lg bg-surface px-6 py-10 text-center">
              <p className="font-medium">No habits yet</p>

              <p className="mt-1 text-sm text-muted">
                Create your first habit above.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {habits.map((habit) => {
                const completedToday = isCompletedToday(habit);

                return (
                  <div
                    key={habit.id}
                    className="border border-border rounded-lg bg-surface p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">
                            {habit.name}
                          </h3>

                          <span className="text-xs uppercase text-muted border border-border rounded-full px-2 py-1">
                            {habit.frequency}
                          </span>
                        </div>

                        {habit.description && (
                          <p className="mt-1 text-sm text-muted">
                            {habit.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleComplete(habit.id)}
                          disabled={completedToday}
                          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {completedToday
                            ? "✓ Completed today"
                            : "✓ Complete"}
                        </button>

                        <button
                          onClick={() => handleDelete(habit.id)}
                          className="rounded-lg border border-border px-4 py-2 text-sm text-red-500 hover:border-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted">
                          Current streak
                        </p>

                        <p className="mt-1 text-xl font-semibold">
                          🔥 {habit.current_streak}
                        </p>
                      </div>

                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted">
                          Best streak
                        </p>

                        <p className="mt-1 text-xl font-semibold">
                          🏆 {habit.best_streak}
                        </p>
                      </div>

                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted">
                          Target
                        </p>

                        <p className="mt-1 text-xl font-semibold">
                          {habit.target_per_week}/week
                        </p>
                      </div>

                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted">
                          Started
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {habit.start_date || "Today"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

