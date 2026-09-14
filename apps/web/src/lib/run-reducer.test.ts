import { previewRun } from "./preview-fixture";
import { initialRunState, runReducer } from "./run-reducer";
import type { ForemanEvent } from "./types";

describe("runReducer", () => {
  it("hydrates and applies sequenced verification events", () => {
    const hydrated = runReducer(initialRunState, { type: "hydrate", run: previewRun });
    const event: ForemanEvent = {
      type: "verification.updated",
      sequence: 8,
      timestamp: "2026-09-13T16:00:00Z",
      verification: { ...previewRun.verifications[0], status: "failed", summary: "Compiler exited 1" },
    };
    const next = runReducer(hydrated, { type: "event", event });
    expect(next.run?.verifications[0].status).toBe("failed");
    expect(next.lastSequence).toBe(8);
  });

  it("ignores replayed or out-of-order SSE events", () => {
    const state = { ...initialRunState, run: previewRun, lastSequence: 9 };
    const next = runReducer(state, {
      type: "event",
      event: { type: "run.status", sequence: 8, status: "completed", timestamp: "2026-09-13T16:00:00Z" },
    });
    expect(next).toBe(state);
  });

  it("moves a run to the human boundary when escalation arrives", () => {
    const run = { ...previewRun, status: "running" as const, humanDecision: undefined };
    const state = { ...initialRunState, run };
    const next = runReducer(state, {
      type: "event",
      event: { type: "human_decision.required", sequence: 1, decision: previewRun.humanDecision!, timestamp: "2026-09-13T16:00:00Z" },
    });
    expect(next.run?.status).toBe("awaiting_human");
    expect(next.run?.humanDecision?.id).toBe("HD-01");
  });
});
