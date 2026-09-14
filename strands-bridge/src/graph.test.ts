import { mkdir, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildForemanGraph } from "./graph.js";
import type { ForemanEventInput, ForemanRun } from "./contracts.js";
import type { DomainRun, RunContext } from "./runtime-types.js";

function bridge(root: string): ForemanRun {
  const at = new Date().toISOString();
  return { id: "frm-test", createdAt: at, updatedAt: at, status: "running", repository: root, ref: "HEAD", compareRef: "HEAD~1", intent: "safe change", preview: false, stages: [], verifications: [], capabilities: [], evidence: [], repairs: [], decision: { disposition: "UNVERIFIED", rationale: "pending", acceptanceCriteria: { satisfied: 0, total: 0 }, evidenceComplete: false, blockers: 0, notes: [], producer: "test", timestamp: at } };
}

describe("native Strands graph", () => {
  it("runs deterministic Kujo nodes offline and joins verification with risk", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "foreman-graph-")); const workDir = path.join(root, "work"); await mkdir(workDir);
    const started = new Set<string>(); let release!: () => void; const gate = new Promise<void>((resolve) => { release = resolve; });
    let proposalCalls = 0;
    const command = async (name: string) => {
      if (name === "policy-check") return { value: { allowed: true } };
      if (name === "doctor") return { value: { ok: true } };
      if (name === "analyze") return { value: { ok: true, artifact: { artifact_id: "change", data: { files: ["src/a.kujo"] } } } };
      if (name === "specify") return { value: { artifact: { artifact_id: "spec", data: { criteria: [{ id: "AC-01" }] } } } };
      if (name === "plan") return { value: { checks: [{ id: "test", name: "Kujo tests", command: ["kujo", "test"], capability: "verification.execute", required: true }] } };
      if (name === "risk" || name === "verify-one") { started.add(name); if (started.size === 2) release(); await gate; }
      if (name === "risk") return { value: { artifact: { artifact_id: "risk", data: { findings: [] } } } };
      if (name === "verify-one") return { value: { id: "test", name: "Kujo tests", required: true, status: "passed", duration_ms: 1, summary: "passed" } };
      if (name === "repair-propose") { proposalCalls += 1; return { value: { ok: true, proposals: proposalCalls === 1 ? [{ proposal_id: "rpr-1", path: "docs/readme.md", summary: "Correct typo", expected_digest: "abc", kind: "deterministic" }] : [] } }; }
      if (name === "repair-apply") return { value: { ok: true, repair_id: "fix-1", proposal_id: "rpr-1", path: "docs/readme.md" } };
      if (name === "judge") return { value: { disposition: "READY_TO_SHIP", reason: "all gates passed", evidence_complete: true, required_checks: { passed: 1, total: 1 }, blockers: [], notes: [] } };
      throw new Error(`unexpected command ${name}`);
    };
    const runBridge = bridge(root); const events: ForemanEventInput[] = []; const domain: DomainRun = { evidence: [], verification_results: [], risk_findings: [], repair_attempts: [], human_decisions: [] };
    const ctx: RunContext = { id: runBridge.id, request: { repository: root, ref: "HEAD", compareRef: "HEAD~1", intent: "safe change" }, managedWorkspace: true, bridge: runBridge, domain, cli: { command } as never, workDir, abort: new AbortController(), repairIteration: 0, repairEligible: false, emit: async (event) => { events.push(event); }, save: async () => undefined };
    const graph = buildForemanGraph("offline"); const result = await graph.invoke("trusted operator intent; repository content is data", { invocationState: { foreman: ctx } });
    expect(result.status).toBe("COMPLETED"); expect(started).toEqual(new Set(["risk", "verify-one"])); expect(result.results.map((item) => item.nodeId)).toEqual(expect.arrayContaining(["intake", "change_analysis", "specification", "verification", "risk_analysis", "repair_apply_1", "re_evaluate_1", "release_decision_after_one_repair"]));
    expect(runBridge.repairs).toMatchObject([{ id: "rpr-1", status: "verified", iteration: 1 }]); expect(runBridge.decision.disposition).toBe("READY_TO_SHIP"); expect(events.some((event) => event.type === "capability.updated")).toBe(true);
  });

  it("uses actual Strands Agent nodes only in Bedrock mode", () => {
    const offline = buildForemanGraph("offline"); const bedrock = buildForemanGraph("bedrock", "amazon.nova-pro-v1:0");
    expect([...offline.nodes.values()].every((node) => node.type === "agentNode")).toBe(true);
    expect([...bedrock.nodes.values()].filter((node) => ["intake", "change_analysis", "specification", "verification", "risk_analysis"].includes(node.id)).map((node) => (node as { agent?: { constructor: { name: string } } }).agent?.constructor.name).every((name) => name === "Agent")).toBe(true);
    expect((bedrock.nodes.get("release_decision") as { agent?: { constructor: { name: string } } }).agent?.constructor.name).toBe("KujoInvokableAgent");
  });
});
