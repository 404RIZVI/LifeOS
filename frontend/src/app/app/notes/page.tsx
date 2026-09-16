"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

interface Note {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface NoteResponse {
  items: Note[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const categories = [
  "personal",
  "study",
  "work",
  "ideas",
  "other",
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadNotes() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: "1",
        page_size: "100",
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (category) {
        params.set("category", category);
      }

      const response = await fetch(
        `${API_URL}/notes?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load notes.");
      }

      const data: NoteResponse = await response.json();
      setNotes(data.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load notes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, [search, category]);

  function clearEditor() {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setCategory("");
    setTags("");
  }

  function openNote(note: Note) {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content ?? "");
    setCategory(note.category ?? "");
    setTags(note.tags.join(", "));
  }

  async function saveNote() {
    if (!title.trim()) {
      setError("Please enter a note title.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: title.trim(),
        content: content,
        category: category || null,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const url = selectedNote
        ? `${API_URL}/notes/${selectedNote.id}`
        : `${API_URL}/notes`;

      const response = await fetch(url, {
        method: selectedNote ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail ?? "Failed to save note."
        );
      }

      clearEditor();
      await loadNotes();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save note."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(noteId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/notes/${noteId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete note.");
      }

      if (selectedNote?.id === noteId) {
        clearEditor();
      }

      await loadNotes();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete note."
      );
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="font-semibold"
            >
              LifeOS
            </Link>

            <span className="text-muted">/</span>

            <span className="text-sm text-muted">
              Notes
            </span>
          </div>

          <Link
            href="/app"
            className="text-sm text-muted hover:text-foreground"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              Notes
            </h1>

            <p className="mt-1 text-sm text-muted">
              Capture ideas, information and thoughts.
            </p>
          </div>

          <button
            onClick={clearEditor}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition"
          >
            + New Note
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid lg:grid-cols-[320px_1fr] gap-6">
          <section className="border border-border rounded-lg bg-surface overflow-hidden">
            <div className="p-4 border-b border-border space-y-3">
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">
                  All categories
                </option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-sm text-muted">
                  Loading notes...
                </div>
              ) : notes.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted">
                  No notes found.
                </div>
              ) : (
                notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => openNote(note)}
                    className={`w-full text-left px-4 py-4 border-b border-border hover:bg-background transition ${
                      selectedNote?.id === note.id
                        ? "bg-background"
                        : ""
                    }`}
                  >
                    <div className="font-medium truncate">
                      {note.title}
                    </div>

                    <div className="mt-1 text-xs text-muted line-clamp-2">
                      {note.content || "No content"}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      {note.category && (
                        <span className="text-xs rounded-full border border-border px-2 py-0.5 text-muted">
                          {note.category}
                        </span>
                      )}

                      <span className="text-xs text-muted">
                        {new Date(
                          note.updated_at
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="border border-border rounded-lg bg-surface p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">
                  {selectedNote
                    ? "Edit Note"
                    : "New Note"}
                </h2>

                <p className="mt-1 text-xs text-muted">
                  {selectedNote
                    ? "Update your note."
                    : "Write something you want to remember."}
                </p>
              </div>

              {selectedNote && (
                <button
                  onClick={() =>
                    deleteNote(selectedNote.id)
                  }
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Note title"
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Content
                </label>

                <textarea
                  value={content}
                  onChange={(event) =>
                    setContent(event.target.value)
                  }
                  placeholder="Start writing..."
                  rows={14}
                  className="w-full resize-y rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="">
                      No category
                    </option>

                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tags
                  </label>

                  <input
                    type="text"
                    value={tags}
                    onChange={(event) =>
                      setTags(event.target.value)
                    }
                    placeholder="python, study, idea"
                    className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                  />

                  <p className="mt-1 text-xs text-muted">
                    Separate tags with commas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={saveNote}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
                >
                  {saving
                    ? "Saving..."
                    : selectedNote
                    ? "Update Note"
                    : "Save Note"}
                </button>

                <button
                  onClick={clearEditor}
                  className="px-5 py-2.5 rounded-lg border border-border text-sm hover:bg-background transition"
                >
                  Clear
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
