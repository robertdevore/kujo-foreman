import type { ForemanEvent, ForemanRun, StartRunRequest } from "./types";

const apiBase = (import.meta.env.VITE_FOREMAN_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const foremanApi = {
  startRun: (payload: StartRunRequest) =>
    request<ForemanRun>("/api/runs", { method: "POST", body: JSON.stringify(payload) }),
  getRun: (id: string) => request<ForemanRun>(`/api/runs/${encodeURIComponent(id)}`),
  stopRun: (id: string) => request<ForemanRun>(`/api/runs/${encodeURIComponent(id)}/stop`, { method: "POST" }),
  resolveDecision: (runId: string, decisionId: string, optionId: string) =>
    request<ForemanRun>(`/api/runs/${encodeURIComponent(runId)}/decisions/${encodeURIComponent(decisionId)}`, {
      method: "POST",
      body: JSON.stringify({ optionId }),
    }),
  evidenceUrl: (runId: string, evidenceId: string) =>
    `${apiBase}/api/runs/${encodeURIComponent(runId)}/evidence/${encodeURIComponent(evidenceId)}`,
  eventUrl: (id: string) => `${apiBase}/api/runs/${encodeURIComponent(id)}/events`,
};

export function parseForemanEvent(raw: string): ForemanEvent | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const candidate = value as Record<string, unknown>;
    if (typeof candidate.type !== "string" || typeof candidate.sequence !== "number") return null;
    return value as ForemanEvent;
  } catch {
    return null;
  }
}
