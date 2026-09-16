"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

type EventCategory =
  | "personal"
  | "work"
  | "study"
  | "health"
  | "other";

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  all_day: boolean;
  location: string | null;
  category: EventCategory;
  created_at: string;
  updated_at: string;
};

const categoryLabels: Record<EventCategory, string> = {
  personal: "Personal",
  work: "Work",
  study: "Study",
  health: "Health",
  other: "Other",
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function toLocalDateTimeValue(date: Date) {
  return `${toDateInputValue(date)}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const mondayFirstIndex = (firstDay.getDay() + 6) % 7;

  const days: Date[] = [];

  for (let i = 0; i < mondayFirstIndex; i++) {
    const date = new Date(year, month, i - mondayFirstIndex + 1);
    days.push(date);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  while (days.length < 42) {
    const last = days[days.length - 1];

    if (!last) {
      break;
    }

    const next = new Date(
      last.getFullYear(),
      last.getMonth(),
      last.getDate() + 1
    );

    days.push(next);
  }

  return days;
}

function formatEventTime(event: CalendarEvent) {
  if (event.all_day) return "All day";

  const date = new Date(event.start_at);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CalendarPage() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(
    toDateInputValue(today)
  );

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [category, setCategory] =
    useState<EventCategory>("personal");

  const monthDays = useMemo(
    () =>
      getMonthDays(
        currentMonth.getFullYear(),
        currentMonth.getMonth()
      ),
    [currentMonth]
  );

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");

      const monthStart = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1,
        0,
        0,
        0
      );

      const monthEnd = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const params = new URLSearchParams({
        start_at: monthStart.toISOString(),
        end_at: monthEnd.toISOString(),
        page: "1",
        page_size: "500",
      });

      const response = await fetch(
        `${API_URL}/calendar/events?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load calendar events.");
      }

      const data = await response.json();
      setEvents(data.items ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load calendar events."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, [currentMonth]);

  function goPreviousMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  }

  function goNextMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  }

  function goToday() {
    const now = new Date();

    setCurrentMonth(
      new Date(now.getFullYear(), now.getMonth(), 1)
    );

    setSelectedDate(toDateInputValue(now));
  }

  function eventsForDate(date: Date) {
    const dateKey = toDateInputValue(date);

    return events.filter((event) => {
      return toDateInputValue(new Date(event.start_at)) === dateKey;
    });
  }

  async function createEvent() {
    if (!title.trim()) {
      setError("Please enter an event title.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const start = allDay
        ? new Date(`${selectedDate}T00:00:00`)
        : new Date(`${selectedDate}T${startTime}:00`);

      const end = allDay
        ? null
        : new Date(`${selectedDate}T${endTime}:00`);

      if (end && end < start) {
        setError("End time cannot be earlier than start time.");
        setSaving(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/calendar/events`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            start_at: start.toISOString(),
            end_at: end ? end.toISOString() : null,
            all_day: allDay,
            location: location.trim() || null,
            category,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail ?? "Failed to create event."
        );
      }

      setTitle("");
      setDescription("");
      setLocation("");
      setAllDay(false);

      await loadEvents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create event."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(id: string) {
    const confirmed = window.confirm(
      "Delete this calendar event?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/calendar/events/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete event.");
      }

      await loadEvents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete event."
      );
    }
  }

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/app"
              className="text-sm text-muted hover:text-primary"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-2 text-3xl font-semibold">
              Calendar
            </h1>

            <p className="mt-1 text-sm text-muted">
              Plan your days, events and important activities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:border-primary"
            >
              Today
            </button>

            <button
              onClick={goPreviousMonth}
              className="rounded-lg border border-border bg-surface px-3 py-2 hover:border-primary"
              aria-label="Previous month"
            >
              ←
            </button>

            <button
              onClick={goNextMonth}
              className="rounded-lg border border-border bg-surface px-3 py-2 hover:border-primary"
              aria-label="Next month"
            >
              →
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-xl font-semibold">
                {monthName}
              </h2>
            </div>

            <div className="grid grid-cols-7 border-b border-border">
              {[
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Sun",
              ].map((day) => (
                <div
                  key={day}
                  className="border-r border-border px-2 py-3 text-center text-xs font-medium text-muted last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

              <div className="grid grid-cols-7">
              {monthDays.map((date, index) => {
                const dateKey = toDateInputValue(date);
                const dayEvents = eventsForDate(date);

                const isCurrentMonth =
                  date.getMonth() === currentMonth.getMonth();

                const isToday =
                  dateKey === toDateInputValue(today);

                const isSelected =
                  dateKey === selectedDate;

                return (
                  <button
                    key={`${dateKey}-${index}`}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`min-h-32 border-r border-b border-border p-2 text-left transition-colors ${
                      isSelected
                        ? "bg-primary/5"
                        : "hover:bg-muted/5"
                    } ${
                      !isCurrentMonth
                        ? "opacity-40"
                        : ""
                    }`}
                  >
                    <div
                      className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                        isToday
                          ? "bg-primary text-white"
                          : ""
                      }`}
                    >
                      {date.getDate()}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="truncate rounded bg-primary/10 px-2 py-1 text-xs"
                          title={event.title}
                        >
                          <span className="font-medium">
                            {formatEventTime(event)}
                          </span>{" "}
                          {event.title}
                        </div>
                      ))}

                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-xl border border-border bg-surface p-5">
              <h2 className="text-lg font-semibold">
                Add Event
              </h2>

              <p className="mt-1 text-sm text-muted">
                {new Date(
                  `${selectedDate}T00:00:00`
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>

              <div className="mt-4 space-y-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Description (optional)"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={allDay}
                    onChange={(e) =>
                      setAllDay(e.target.checked)
                    }
                  />
                  All-day event
                </label>

                {!allDay && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-muted">
                        Start
                      </label>

                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) =>
                          setStartTime(e.target.value)
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-muted">
                        End
                      </label>

                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) =>
                          setEndTime(e.target.value)
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}

                <input
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  placeholder="Location (optional)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as EventCategory
                    )
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(categoryLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>

                <button
                  onClick={createEvent}
                  disabled={saving}
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Event"}
                </button>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Selected Day
                </h2>

                {loading && (
                  <span className="text-xs text-muted">
                    Loading...
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {eventsForDate(
                  new Date(`${selectedDate}T00:00:00`)
                ).length === 0 ? (
                  <p className="text-sm text-muted">
                    No events for this day.
                  </p>
                ) : (
                  eventsForDate(
                    new Date(`${selectedDate}T00:00:00`)
                  ).map((event) => (
                    <div
                      key={event.id}
                      className="rounded-lg border border-border p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-medium">
                            {event.title}
                          </h3>

                          <p className="mt-1 text-xs text-muted">
                            {formatEventTime(event)} ·{" "}
                            {categoryLabels[event.category]}
                          </p>

                          {event.location && (
                            <p className="mt-1 text-xs text-muted">
                              📍 {event.location}
                            </p>
                          )}

                          {event.description && (
                            <p className="mt-2 text-sm text-muted">
                              {event.description}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() =>
                            deleteEvent(event.id)
                          }
                          className="shrink-0 text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
