"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "completed";
  progress: number;
  category: string | null;
  start_date: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
};

type GoalResponse = {
  items: Goal[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [progress, setProgress] = useState("0");
  const [targetDate, setTargetDate] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadGoals() {
    try {
      setLoading(true);
      setError("");

      const data = await api.get<GoalResponse>("/goals?page_size=100");
      setGoals(data.items);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load goals."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Goal title is required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await api.post<Goal>("/goals", {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        progress: Number(progress),
        start_date: null,
        target_date: targetDate || null,
      });

      setTitle("");
      setDescription("");
      setCategory("");
      setProgress("0");
      setTargetDate("");

      await loadGoals();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to create goal."
      );
    } finally {
      setCreating(false);
    }
  }

  async function completeGoal(id: string) {
    try {
      setError("");
      await api.post<Goal>(`/goals/${id}/complete`);
      await loadGoals();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to complete goal."
      );
    }
  }

  async function deleteGoal(id: string) {
    try {
      setError("");
      await api.delete<void>(`/goals/${id}`);
      await loadGoals();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to delete goal."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">LifeOS</p>
            <h1 className="text-3xl font-bold">Goals</h1>
            <p className="mt-1 text-slate-400">
              Turn your plans into measurable progress.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/app"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Dashboard
            </Link>

            <Link
              href="/app/settings"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Settings
            </Link>
          </div>
        </div>

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-5 text-xl font-semibold">Create a goal</h2>

          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Goal title"
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
            />

            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (e.g. Career, Fitness)"
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={3}
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500 md:col-span-2"
            />

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Starting progress: {progress}%
              </label>

              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Target date
              </label>

              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-indigo-600 px-5 py-3 font-medium hover:bg-indigo-500 disabled:opacity-50 md:col-span-2"
            >
              {creating ? "Creating..." : "Create Goal"}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Goals</h2>

            <span className="text-sm text-slate-400">
              {goals.length} goal{goals.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              Loading goals...
            </div>
          ) : goals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
              <h3 className="text-lg font-semibold">No goals yet</h3>

              <p className="mt-2 text-slate-400">
                Create your first goal above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {goals.map((goal) => (
                <article
                  key={goal.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {goal.title}
                      </h3>

                      {goal.category && (
                        <span className="mt-2 inline-block rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                          {goal.category}
                        </span>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        goal.status === "completed"
                          ? "bg-emerald-900/50 text-emerald-300"
                          : "bg-indigo-900/50 text-indigo-300"
                      }`}
                    >
                      {goal.status === "completed"
                        ? "Completed"
                        : "Active"}
                    </span>
                  </div>

                  {goal.description && (
                    <p className="mt-4 text-sm text-slate-400">
                      {goal.description}
                    </p>
                  )}

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span>{goal.progress}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  {goal.target_date && (
                    <p className="mt-4 text-sm text-slate-400">
                      Target: {goal.target_date}
                    </p>
                  )}

                  <div className="mt-5 flex gap-2">
                    {goal.status !== "completed" && (
                      <button
                        onClick={() => completeGoal(goal.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm hover:bg-emerald-500"
                      >
                        Complete
                      </button>
                    )}

                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
