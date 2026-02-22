// ---------------------------------------------------------------------------
// Typed API client for the Atelier REST backend
// ---------------------------------------------------------------------------
//
// The backend does not exist yet. This module defines the fetch wrapper and
// response envelope so that hooks and components can program against a stable
// interface. When the Rust API is ready, only API_BASE needs to change.
// ---------------------------------------------------------------------------

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// ── Response envelope ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  error?: string
  meta?: {
    page?: number
    per_page?: number
    total?: number
  }
}

// ── Error class ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`API ${status}: ${body}`)
    this.name = "ApiError"
  }
}

// ── Fetch wrapper ──────────────────────────────────────────────────────────

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  if (!res.ok) {
    throw new ApiError(res.status, await res.text())
  }

  return res.json() as Promise<ApiResponse<T>>
}
