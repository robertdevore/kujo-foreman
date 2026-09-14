import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { CapabilityCall, Evidence, HumanDecision, ReleaseDecision, Repair, Verification } from "./contracts.js";
import type { DomainRun, RunContext } from "./runtime-types.js";

const now = () => new Date().toISOString();
const rec = (value: unknown): Record<string, unknown> => value && typeof value === "object" ? value as Record<string, unknown> : {};
const arr = (value: unknown): Array<Record<string, unknown>> => Array.isArray(value) ? value.map(rec) : [];
const text = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;
const num = (value: unknown, fallback = 0) => typeof value === "number" ? value : fallback;

async function capability<T>(ctx: RunContext, agent: string, name: string, effect: CapabilityCall["effect"], scope: string, action: () => Promise<T>): Promise<T> {
  const call: CapabilityCall = { id: `cap-${ctx.id}-${ctx.bridge.capabilities.length + 1}`, agent, capability: name, effect, status: "requested", scope, producer: "Kujo policy", timestamp: now() };
  ctx.bridge.capabilities.push(call); await ctx.emit({ type: "capability.updated", capability: call, timestamp: call.timestamp });
  try {
    const policy = await ctx.cli.command<Record<string, unknown>>("policy-check", ["--agent", agent, "--capability", name], { signal: ctx.abort.signal, allowFailure: true });
    if (policy.value.allowed !== true) { call.status = "denied"; call.timestamp = now(); await ctx.emit({ type: "capability.updated", capability: call, timestamp: call.timestamp }); throw new Error(`Kujo policy denied ${agent}:${name}`); }
    call.status = "allowed"; call.timestamp = now(); await ctx.emit({ type: "capability.updated", capability: call, timestamp: call.timestamp });
    const value = await action(); call.status = "completed"; call.timestamp = now(); await ctx.emit({ type: "capability.updated", capability: call, timestamp: call.timestamp }); return value;
  }
  catch (error) { if (call.status !== "denied") { call.status = "failed"; call.timestamp = now(); await ctx.emit({ type: "capability.updated", capability: call, timestamp: call.timestamp }); } throw error; }
}

export async function intake(ctx: RunContext): Promise<Record<string, unknown>> {
  return capability(ctx, "change-analyst", "repo.read", "read", ctx.request.repository, async () => {
    const result = await ctx.cli.command<Record<string, unknown>>("doctor", ["--repo", ctx.request.repository], { signal: ctx.abort.signal });
    return result.value;
  });
}

export async function changeAnalysis(ctx: RunContext): Promise<Record<string, unknown>> {
  return capability(ctx, "change-analyst", "git.read", "read", `${ctx.request.compareRef}..${ctx.request.ref}`, async () => {
    const result = await ctx.cli.command<Record<string, unknown>>("analyze", ["--repo", ctx.request.repository, "--base", ctx.request.compareRef ?? "HEAD~1", "--head", ctx.request.ref], { signal: ctx.abort.signal });
    const artifact = rec(result.value.artifact); ctx.domain.change_set = rec(artifact.data); ctx.domain.evidence = [...(ctx.domain.evidence ?? []), artifact];
    return artifact;
  });
}

async function withChangeFile<T>(ctx: RunContext, command: "specify" | "risk"): Promise<T> {
  const file = path.join(ctx.workDir, "change.json");
  await writeFile(file, JSON.stringify({ artifact: { data: ctx.domain.change_set ?? {} } }), { mode: 0o600 });
  const result = await ctx.cli.command<T>(command, ["--intent", ctx.request.intent, "--change", file], { signal: ctx.abort.signal });
  return result.value;
}

export async function specification(ctx: RunContext): Promise<Record<string, unknown>> {
  return capability(ctx, "specification", "kujo.spec.contract.validate", "read", "operator-intent+change-analysis", async () => {
    const value = await withChangeFile<Record<string, unknown>>(ctx, "specify"); const artifact = rec(value.artifact);
    ctx.domain.specification = rec(artifact.data); ctx.domain.evidence = [...(ctx.domain.evidence ?? []), artifact]; return artifact;
  });
}

function lane(name: string): Verification["lane"] {
  const value = name.toLowerCase();
  if (value.includes("build")) return "build"; if (value.includes("test")) return "test"; if (value.includes("security") || value.includes("fence")) return "security"; return "quality";
}

export async function verification(ctx: RunContext): Promise<Record<string, unknown>> {
  const plan = await capability(ctx, "verification", "repo.read", "read", ctx.request.repository, async () => (await ctx.cli.command<Record<string, unknown>>("plan", ["--repo", ctx.request.repository], { signal: ctx.abort.signal })).value);
  const checks = arr(plan.checks); ctx.domain.verification_plan = checks;
  const results = await Promise.all(checks.map(async (check) => {
    const id = text(check.id, `check-${ctx.bridge.verifications.length + 1}`); const checkFile = path.join(ctx.workDir, `${id}.json`);
    await writeFile(checkFile, JSON.stringify(check), { mode: 0o600 });
    const ui: Verification = { id, name: text(check.name, id), lane: lane(text(check.name)), status: "running", command: Array.isArray(check.command) ? check.command.map(String).join(" ") : undefined, producer: "Verification Agent", timestamp: now() };
    const existing = ctx.bridge.verifications.findIndex((value) => value.id === id); if (existing >= 0) ctx.bridge.verifications[existing] = ui; else ctx.bridge.verifications.push(ui);
    await ctx.emit({ type: "verification.updated", verification: ui, timestamp: ui.timestamp });
    const result = await capability(ctx, "verification", text(check.capability, "verification.execute"), "execute", ctx.request.repository, async () => (await ctx.cli.command<Record<string, unknown>>("verify-one", ["--repo", ctx.request.repository, "--check", checkFile, "--kujo-bin", ctx.cli.executable], { signal: ctx.abort.signal, allowFailure: true })).value);
    ui.status = text(result.status) === "passed" ? "passed" : "failed"; ui.durationMs = num(result.duration_ms); ui.summary = text(result.summary); ui.timestamp = now();
    await ctx.emit({ type: "verification.updated", verification: ui, timestamp: ui.timestamp }); return result;
  }));
  ctx.domain.verification_results = results;
  return { results };
}

export async function riskAnalysis(ctx: RunContext): Promise<Record<string, unknown>> {
  return capability(ctx, "risk", "git.read", "read", `${ctx.request.compareRef}..${ctx.request.ref}`, async () => {
    const value = await withChangeFile<Record<string, unknown>>(ctx, "risk"); const artifact = rec(value.artifact);
    ctx.domain.risk_findings = arr(rec(artifact.data).findings); ctx.domain.evidence = [...(ctx.domain.evidence ?? []), artifact]; return artifact;
  });
}

export async function repairProposal(ctx: RunContext): Promise<Record<string, unknown>> {
  return capability(ctx, "repair", "repo.read", "read", ctx.request.repository, async () => {
    const file = path.join(ctx.workDir, `repair-change-${ctx.repairIteration + 1}.json`); await writeFile(file, JSON.stringify({ artifact: { data: ctx.domain.change_set ?? {} } }), { mode: 0o600 });
    const value = (await ctx.cli.command<Record<string, unknown>>("repair-propose", ["--repo", ctx.request.repository, "--change", file], { signal: ctx.abort.signal })).value;
    const proposals = arr(value.proposals); ctx.repairEligible = ctx.managedWorkspace && ctx.repairIteration < 2 && proposals.length > 0; (ctx.domain as Record<string, unknown>).pending_repair_proposals = proposals;
    if (proposals.length > 0 && !ctx.managedWorkspace) ctx.bridge.decision.notes.push("Automatic repair was not attempted because the selected repository is not a Foreman-managed isolated workspace.");
    return { ...value, eligible: ctx.repairEligible, iteration: ctx.repairIteration + 1 };
  });
}

export async function repairApply(ctx: RunContext): Promise<Record<string, unknown>> {
  if (!ctx.repairEligible || ctx.repairIteration >= 2) throw new Error("bounded repair edge was entered without an eligible proposal");
  const proposals = arr((ctx.domain as Record<string, unknown>).pending_repair_proposals); const proposal = proposals[0]; if (!proposal) throw new Error("repair proposal missing");
  return capability(ctx, "repair", "worktree.write.bounded", "write", `${ctx.request.repository}/${text(proposal.path)}`, async () => {
    const iteration = ctx.repairIteration + 1; const ui: Repair = { id: text(proposal.proposal_id, `repair-${iteration}`), status: "applying", path: text(proposal.path), reason: text(proposal.summary), iteration, producer: "Kujo Repair", timestamp: now() };
    ctx.bridge.repairs.push(ui); await ctx.emit({ type: "repair.updated", repair: ui, timestamp: ui.timestamp });
    const file = path.join(ctx.workDir, `repair-proposal-${iteration}.json`); await writeFile(file, JSON.stringify(proposal), { mode: 0o600 });
    try {
      const result = (await ctx.cli.command<Record<string, unknown>>("repair-apply", ["--repo", ctx.request.repository, "--proposal", file], { signal: ctx.abort.signal, allowFailure: true })).value;
      ctx.repairIteration = iteration; ctx.repairEligible = false; ctx.domain.repair_attempts = [...(ctx.domain.repair_attempts ?? []), { ...result, iteration, proposal }];
      ui.status = result.ok === true ? "applying" : "failed"; ui.timestamp = now(); await ctx.emit({ type: "repair.updated", repair: ui, timestamp: ui.timestamp });
      if (result.ok !== true) throw new Error(`Kujo repair failed: ${text(result.message, "unknown failure")}`); return result;
    } catch (error) {
      ui.status = "failed"; ui.timestamp = now(); await ctx.emit({ type: "repair.updated", repair: ui, timestamp: ui.timestamp }); throw error;
    }
  });
}

export async function reEvaluate(ctx: RunContext): Promise<Record<string, unknown>> {
  const result = await verification(ctx); const passed = (ctx.domain.verification_results ?? []).every((check) => check.required !== true || check.status === "passed");
  const repair = ctx.bridge.repairs.at(-1); if (repair) { repair.status = passed ? "verified" : "failed"; repair.timestamp = now(); await ctx.emit({ type: "repair.updated", repair, timestamp: repair.timestamp }); }
  return { ...result, repair_verified: passed, iteration: ctx.repairIteration };
}

function releaseDecision(raw: Record<string, unknown>, ctx: RunContext): ReleaseDecision {
  const checks = rec(raw.required_checks); const criteria = arr(rec(ctx.domain.specification).criteria);
  return { disposition: text(raw.disposition, "BLOCKED") as ReleaseDecision["disposition"], rationale: text(raw.reason, "Kujo did not authorize release."), acceptanceCriteria: { satisfied: num(checks.passed), total: num(checks.total, criteria.length) }, evidenceComplete: raw.evidence_complete === true, blockers: Array.isArray(raw.blockers) ? raw.blockers.length : 0, notes: Array.isArray(raw.notes) ? raw.notes.map(String) : [], producer: "Kujo Release Judge", timestamp: now(), evidenceIds: (ctx.domain.evidence ?? []).map((e) => text(e.artifact_id)).filter(Boolean) };
}

export async function judge(ctx: RunContext): Promise<Record<string, unknown>> {
  return capability(ctx, "release-judge", "evidence.read", "decision", ctx.id, async () => {
    ctx.domain.schema = "foreman.run/v1"; ctx.domain.run_id = ctx.id; ctx.domain.project = { repository: ctx.request.repository, base_ref: ctx.request.compareRef, head_ref: ctx.request.ref }; ctx.domain.intent = { source: "operator", text: ctx.request.intent, trust: "trusted_instruction" };
    const runFile = path.join(ctx.workDir, "run.json"); await writeFile(runFile, JSON.stringify(ctx.domain), { mode: 0o600 });
    const raw = (await ctx.cli.command<Record<string, unknown>>("judge", ["--run", runFile], { signal: ctx.abort.signal })).value; ctx.domain.release_decision = raw;
    ctx.bridge.decision = releaseDecision(raw, ctx); await ctx.emit({ type: "release_decision.updated", decision: ctx.bridge.decision, timestamp: ctx.bridge.decision.timestamp });
    return raw;
  });
}

export async function writeEvidence(ctx: RunContext): Promise<void> {
  const runFile = path.join(ctx.workDir, "run.json"); await writeFile(runFile, JSON.stringify(ctx.domain), { mode: 0o600 });
  const result = await capability(ctx, "release-judge", "evidence.read", "read", ctx.id, async () => (await ctx.cli.command<Record<string, unknown>>("evidence", ["--run", runFile, "--output", path.join(ctx.workDir, "evidence")], { signal: ctx.abort.signal })).value);
  const pkgPath = text(result.path); const manifest = rec(result.manifest);
  for (const item of arr(manifest.files)) {
    const filename = text(item.path); const evidence: Evidence = { id: filename, kind: filename.endsWith(".json") ? "structured" : "report", title: filename, status: "complete", uri: pkgPath ? path.join(pkgPath, filename) : undefined, summary: `SHA-256 ${text(item.sha256).slice(0, 12)}…`, producer: "Kujo Evidence", timestamp: now() };
    const existing = ctx.bridge.evidence.findIndex((value) => value.id === evidence.id); if (existing >= 0) ctx.bridge.evidence[existing] = evidence; else ctx.bridge.evidence.push(evidence);
    await ctx.emit({ type: "evidence.updated", evidence, timestamp: evidence.timestamp });
  }
}

export function makeHumanDecision(ctx: RunContext): HumanDecision | undefined {
  const risk = (ctx.domain.risk_findings ?? []).find((item) => item.requires_human === true && text(item.status, "open") === "open"); if (!risk) return undefined;
  return { id: text(risk.id, `decision-${ctx.id}`), question: `Should this release authorize the ${text(risk.category, "high-consequence")} behavior described by the change?`, reason: text(risk.summary, "The available requirement does not authorize this consequential behavior."), evidence: Array.isArray(risk.evidence) ? risk.evidence.map(String) : [], options: [{ id: "keep-existing", label: "Require existing behavior", description: "Block this candidate until the implementation is revised." }, { id: "accept-change", label: "Authorize this change", description: "Record explicit authority for the observed behavior and continue." }, { id: "reject-change", label: "Reject the candidate", description: "Block release without authorizing either behavior." }], recommendation: "keep-existing", confidence: "high", producer: "Escalation Agent", timestamp: now() };
}
