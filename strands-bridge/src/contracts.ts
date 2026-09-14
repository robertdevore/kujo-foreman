export type StageId = "intake" | "change_analysis" | "specification" | "verification" | "risk_analysis" | "release_decision";
export type RunStatus = "queued" | "running" | "awaiting_human" | "completed" | "failed" | "stopped";
export type Disposition = "UNVERIFIED" | "READY_TO_SHIP" | "READY_WITH_NOTES" | "BLOCKED" | "HUMAN_DECISION_REQUIRED";

export interface Provenance { producer: string; timestamp: string; evidenceIds?: string[] }
export interface Stage extends Provenance { id: StageId; label: string; status: "pending" | "active" | "passed" | "warning" | "failed"; detail?: string }
export interface Verification extends Provenance { id: string; name: string; lane: "build" | "test" | "quality" | "security" | "behavior"; status: "queued" | "running" | "passed" | "failed" | "blocked"; command?: string; durationMs?: number; summary?: string }
export interface CapabilityCall extends Provenance { id: string; agent: string; capability: string; effect: "read" | "execute" | "write" | "decision"; status: "requested" | "allowed" | "denied" | "completed" | "failed"; scope: string }
export interface Evidence extends Provenance { id: string; kind: string; title: string; status: "complete" | "partial" | "missing"; uri?: string; summary?: string }
export interface Repair extends Provenance { id: string; status: "proposed" | "applying" | "verified" | "failed" | "rejected"; path: string; reason: string; iteration: number }
export interface HumanDecision extends Provenance { id: string; question: string; reason: string; evidence: string[]; options: Array<{ id: string; label: string; description?: string }>; recommendation?: string; confidence?: "low" | "medium" | "high"; selectedOptionId?: string }
export interface ReleaseDecision extends Provenance { disposition: Disposition; rationale: string; acceptanceCriteria: { satisfied: number; total: number }; evidenceComplete: boolean; blockers: number; notes: string[] }
export interface ForemanRun { id: string; createdAt: string; updatedAt: string; status: RunStatus; repository: string; ref: string; compareRef?: string; intent: string; preview: boolean; currentActivity?: string; stages: Stage[]; verifications: Verification[]; capabilities: CapabilityCall[]; evidence: Evidence[]; repairs: Repair[]; humanDecision?: HumanDecision; decision: ReleaseDecision }
export type ForemanEvent =
  | { type: "run.snapshot"; sequence: number; run: ForemanRun }
  | { type: "run.status"; sequence: number; status: RunStatus; activity?: string; timestamp: string }
  | { type: "stage.updated"; sequence: number; stage: Stage; timestamp: string }
  | { type: "verification.updated"; sequence: number; verification: Verification; timestamp: string }
  | { type: "capability.updated"; sequence: number; capability: CapabilityCall; timestamp: string }
  | { type: "evidence.updated"; sequence: number; evidence: Evidence; timestamp: string }
  | { type: "repair.updated"; sequence: number; repair: Repair; timestamp: string }
  | { type: "human_decision.required"; sequence: number; decision: HumanDecision; timestamp: string }
  | { type: "human_decision.resolved"; sequence: number; decisionId: string; optionId: string; timestamp: string }
  | { type: "release_decision.updated"; sequence: number; decision: ReleaseDecision; timestamp: string };
export type ForemanEventInput = ForemanEvent extends infer Event ? Event extends ForemanEvent ? Omit<Event, "sequence"> : never : never;

export interface StartRunRequest { repository?: string; ref?: string; compareRef?: string; intent?: string; demo?: boolean }
export interface AgentCoreInvocationRequest extends StartRunRequest { action?: "start" | "get" | "decide"; runId?: string; decisionId?: string; optionId?: string }

export const stageOrder: StageId[] = ["intake", "change_analysis", "specification", "verification", "risk_analysis", "release_decision"];
export const stageLabels: Record<StageId, string> = { intake: "Intake", change_analysis: "Change analysis", specification: "Specification", verification: "Verification", risk_analysis: "Risk analysis", release_decision: "Release decision" };
