import type { ForemanEvent, ForemanRun, RunState } from "./types";

export type RunAction =
  | { type: "connect" }
  | { type: "connected" }
  | { type: "reconnecting" }
  | { type: "closed" }
  | { type: "error"; message: string }
  | { type: "hydrate"; run: ForemanRun }
  | { type: "event"; event: ForemanEvent };

export const initialRunState: RunState = {
  run: null,
  lastSequence: -1,
  connection: "idle",
};

function replaceById<T extends { id: string }>(items: T[], item: T): T[] {
  const index = items.findIndex((candidate) => candidate.id === item.id);
  if (index < 0) return [...items, item];
  return items.map((candidate, current) => (current === index ? item : candidate));
}

function eventTimestamp(event: ForemanEvent, fallback: string): string {
  return "timestamp" in event ? event.timestamp : fallback;
}

export function runReducer(state: RunState, action: RunAction): RunState {
  if (action.type === "connect") return { ...state, connection: "connecting", error: undefined };
  if (action.type === "connected") return { ...state, connection: "live", error: undefined };
  if (action.type === "reconnecting") return { ...state, connection: "reconnecting" };
  if (action.type === "closed") return { ...state, connection: "closed" };
  if (action.type === "error") return { ...state, connection: "error", error: action.message };
  if (action.type === "hydrate") return { ...state, run: action.run };

  const event = action.event;
  if (event.sequence <= state.lastSequence) return state;
  if (event.type === "run.snapshot") {
    return { ...state, run: event.run, lastSequence: event.sequence };
  }
  if (!state.run) return { ...state, lastSequence: event.sequence };

  const updatedAt = eventTimestamp(event, state.run.updatedAt);
  let run = { ...state.run, updatedAt };
  switch (event.type) {
    case "run.status":
      run = { ...run, status: event.status, currentActivity: event.activity };
      break;
    case "stage.updated":
      run = { ...run, stages: replaceById(run.stages, event.stage) };
      break;
    case "verification.updated":
      run = { ...run, verifications: replaceById(run.verifications, event.verification) };
      break;
    case "capability.updated":
      run = { ...run, capabilities: replaceById(run.capabilities, event.capability) };
      break;
    case "evidence.updated":
      run = { ...run, evidence: replaceById(run.evidence, event.evidence) };
      break;
    case "repair.updated":
      run = { ...run, repairs: replaceById(run.repairs, event.repair) };
      break;
    case "human_decision.required":
      run = { ...run, status: "awaiting_human", humanDecision: event.decision };
      break;
    case "human_decision.resolved":
      if (run.humanDecision?.id === event.decisionId) {
        run = {
          ...run,
          status: "running",
          humanDecision: { ...run.humanDecision, selectedOptionId: event.optionId },
        };
      }
      break;
    case "release_decision.updated":
      run = { ...run, decision: event.decision };
      break;
  }
  return { ...state, run, lastSequence: event.sequence };
}
