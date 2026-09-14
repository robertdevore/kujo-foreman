import type { ForemanRun } from "./types";

const at = "2026-09-13T15:42:18.000Z";
const provenance = (producer: string, evidenceIds?: string[]) => ({ producer, timestamp: at, evidenceIds });

/** Static, explicitly labeled product-tour data. Never returned as run evidence. */
export const previewRun: ForemanRun = {
  id: "PREVIEW-84FD31",
  createdAt: at,
  updatedAt: at,
  status: "awaiting_human",
  repository: "demo/payment-service",
  ref: "feature/bounded-retries",
  compareRef: "main",
  intent: "Add bounded retry support to failed payment captures without changing existing payment policy.",
  preview: true,
  currentActivity: "Waiting for one consequential product decision",
  stages: [
    { id: "intake", label: "Intake", status: "passed", detail: "Change set resolved", ...provenance("Foreman") },
    { id: "change_analysis", label: "Change analysis", status: "passed", detail: "6 meaningful files", ...provenance("Change Analyst", ["EV-01"]) },
    { id: "specification", label: "Specification", status: "passed", detail: "8 acceptance criteria", ...provenance("Specification Agent", ["EV-02"]) },
    { id: "verification", label: "Verification", status: "passed", detail: "Repair re-verified", ...provenance("Verification Agent", ["EV-03", "EV-04"]) },
    { id: "risk_analysis", label: "Risk analysis", status: "warning", detail: "Payment policy ambiguity", ...provenance("Risk Agent", ["EV-05"]) },
    { id: "release_decision", label: "Release decision", status: "active", detail: "Human judgment required", ...provenance("Release Judge") },
  ],
  verifications: [
    { id: "V-01", name: "Compile", lane: "build", status: "passed", durationMs: 4280, summary: "Build completed", ...provenance("Verification Agent", ["EV-03"]) },
    { id: "V-02", name: "Unit suite", lane: "test", status: "passed", durationMs: 7810, summary: "All discovered tests passed", ...provenance("Verification Agent", ["EV-03"]) },
    { id: "V-03", name: "Retry boundary", lane: "behavior", status: "passed", durationMs: 1140, summary: "Targeted check passed after repair", ...provenance("Verification Agent", ["EV-04"]) },
    { id: "V-04", name: "Policy review", lane: "security", status: "blocked", durationMs: 890, summary: "Externally observable retry policy needs authorization", ...provenance("Risk Agent", ["EV-05"]) },
  ],
  capabilities: [
    { id: "C-01", agent: "Change Analyst", capability: "git.read", effect: "read", status: "completed", scope: "selected change set", ...provenance("Kujo policy") },
    { id: "C-02", agent: "Verification Agent", capability: "verification.execute", effect: "execute", status: "completed", scope: "managed workspace", ...provenance("Kujo policy") },
    { id: "C-03", agent: "Repair Agent", capability: "worktree.write.bounded", effect: "write", status: "completed", scope: "1 file / repair branch", ...provenance("Kujo policy") },
    { id: "C-04", agent: "Release Judge", capability: "evidence.read", effect: "read", status: "allowed", scope: "run PREVIEW-84FD31", ...provenance("Kujo policy") },
  ],
  evidence: [
    { id: "EV-01", kind: "change-analysis", title: "Change intelligence", status: "complete", summary: "Payment retry behavior and documentation changed.", ...provenance("Change Analyst") },
    { id: "EV-02", kind: "specification", title: "Acceptance criteria", status: "complete", summary: "Eight criteria with one unresolved policy assumption.", ...provenance("Specification Agent") },
    { id: "EV-03", kind: "verification", title: "Build and test receipt", status: "complete", summary: "Recorded managed-workspace commands and exit status.", ...provenance("Verification Agent") },
    { id: "EV-04", kind: "repair", title: "Bounded repair proof", status: "complete", summary: "Off-by-one correction and targeted re-verification.", ...provenance("Repair Agent") },
    { id: "EV-05", kind: "risk", title: "Payment semantics risk", status: "partial", summary: "Implementation permits five retries; source intent does not authorize that policy.", ...provenance("Risk Agent") },
  ],
  repairs: [
    { id: "R-01", status: "verified", path: "src/retry.kujo", reason: "Off-by-one guard violated acceptance criterion AC-04", iteration: 1, ...provenance("Repair Agent", ["EV-04"]) },
  ],
  humanDecision: {
    id: "HD-01",
    question: "Should failed payment captures be retried up to five times?",
    reason: "The change alters externally observable financial behavior, but the source requirement does not authorize a higher retry limit.",
    evidence: ["EV-02", "EV-05"],
    options: [
      { id: "keep-three", label: "Keep three retries", description: "Preserve the current payment policy." },
      { id: "accept-five", label: "Accept five retries", description: "Authorize the behavior introduced by this change." },
      { id: "revise-requirement", label: "Revise requirement", description: "Pause and provide a different retry policy." },
    ],
    recommendation: "keep-three",
    confidence: "high",
    ...provenance("Escalation Agent", ["EV-02", "EV-05"]),
  },
  decision: {
    disposition: "HUMAN_DECISION_REQUIRED",
    rationale: "Machine-verifiable checks are complete, but payment retry policy requires accountable human judgment.",
    acceptanceCriteria: { satisfied: 7, total: 8 },
    evidenceComplete: false,
    blockers: 1,
    notes: ["One low-risk defect was repaired and re-verified."],
    ...provenance("Release Judge", ["EV-01", "EV-02", "EV-03", "EV-04", "EV-05"]),
  },
};
