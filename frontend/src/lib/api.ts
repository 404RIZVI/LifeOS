/**
 * Central API client. Every backend call goes through here so:
 *  - `credentials: "include"` (send/receive the HttpOnly session cookie)
 *    is never forgotten on an individual call site.
 *  - error responses are parsed into a consistent shape once.
 *  - the base URL is read from one env var, not hardcoded per call.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  fields?: unknown;

  constructor(message: string, status: number, fields?: unknown) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.error?.message ?? "Something went wrong. Please try again.";
    throw new ApiError(message, res.status, body?.error?.fields);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PUT", body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export interface User {
  id: string;
  email: string;
  is_verified: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string | null;
  tags: string[];
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
