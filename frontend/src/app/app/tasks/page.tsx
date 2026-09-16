"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError, type Task } from "@/lib/api";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<{ items: Task[] }>(
        "/tasks?view=all&page_size=100"
      );

      setTasks(response.items);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      setError(
        err instanceof ApiError ? err.message : "Failed to load tasks."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setCreating(true);
      setError(null);

      await api.post("/tasks", {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        category: category.trim() || null,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        start_date: startDate || null,
        due_date: dueDate || null,
        recurrence_rule: null,
        subtasks: [],
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setCategory("");
      setTags("");
      setStartDate("");
      setDueDate("");

      await loadTasks();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      setError(
        err instanceof ApiError ? err.message : "Failed to create task."
      );
    } finally {
      setCreating(false);
    }
  }

  async function completeTask(task: Task) {
    try {
      setError(null);

      await api.post(`/tasks/${task.id}/complete`);

      await loadTasks();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to complete task."
      );
    }
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
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="mt-1 text-sm text-muted">
            Create and manage your tasks.
          </p>
        </div>

        <section className="mt-8 border border-border rounded-lg bg-surface p-6">
          <h2 className="text-lg font-medium">Add a task</h2>

          <form onSubmit={createTask} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Python assignment"
                className="w-full border border-border rounded-md px-3 py-2 bg-background outline-none focus:border-primary"
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add some details..."
                rows={3}
                className="w-full border border-border rounded-md px-3 py-2 bg-background outline-none focus:border-primary"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(
                      e.target.value as
                        | "low"
                        | "medium"
                        | "high"
                        | "urgent"
                    )
                  }
                  className="w-full border border-border rounded-md px-3 py-2 bg-background outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>

                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. College"
                  className="w-full border border-border rounded-md px-3 py-2 bg-background outline-none focus:border-primary"
                  maxLength={100}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tags
              </label>

              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="college, python, urgent"
                className="w-full border border-border rounded-md px-3 py-2 bg-background outline-none focus:border-primary"
              />

              <p className="mt-1 text-xs text-muted">
                Separate multiple tags with commas.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-border rounded-md px-3 py-2 bg-background outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Due date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-border rounded-md px-3 py-2 bg-background outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="border border-primary rounded-md px-5 py-2 font-medium hover:bg-primary/10 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Task"}
            </button>
          </form>
        </section>

        {error && (
          <div className="mt-6 border border-red-500/30 rounded-lg p-4 text-red-500">
            {error}
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wide">
            All Tasks
          </h2>

          {loading ? (
            <div className="mt-3 border border-border rounded-lg p-6 text-muted">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="mt-3 border border-border rounded-lg p-8 text-center text-muted">
              No tasks yet.
            </div>
          ) : (
            <div className="mt-3 border border-border rounded-lg bg-surface overflow-hidden">
              <div className="divide-y divide-border">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="px-6 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <h3
                        className={`font-medium ${
                          task.status === "completed"
                            ? "line-through opacity-60"
                            : ""
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="mt-1 text-sm text-muted">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                        <span>Priority: {task.priority}</span>

                        {task.category && (
                          <span>Category: {task.category}</span>
                        )}

                        {task.due_date && (
                          <span>Due: {task.due_date}</span>
                        )}

                        <span className="uppercase">
                          {task.status}
                        </span>
                      </div>
                    </div>

                    {task.status === "active" && (
                      <button
                        onClick={() => completeTask(task)}
                        className="shrink-0 border border-border rounded-md px-3 py-2 text-sm hover:border-primary transition-colors"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
