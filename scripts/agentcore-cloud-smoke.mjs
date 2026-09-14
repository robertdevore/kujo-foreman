import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";

const runtimeArn = process.env.FOREMAN_AGENTCORE_RUNTIME_ARN;
if (!runtimeArn) {
  console.error("Set FOREMAN_AGENTCORE_RUNTIME_ARN to the deployed runtime ARN.");
  process.exit(2);
}

const profile = process.env.AWS_PROFILE;
const region = process.env.AWS_REGION ?? "us-east-1";
const sessionId = randomUUID();
const workspace = await mkdtemp(join(tmpdir(), "foreman-agentcore-smoke-"));

const invoke = async (payload, label) => {
  const responsePath = join(workspace, `${label}.json`);
  const payloadPath = join(workspace, `${label}-payload.json`);
  await writeFile(payloadPath, JSON.stringify(payload), "utf8");
  const args = [
    "bedrock-agentcore",
    "invoke-agent-runtime",
    "--agent-runtime-arn",
    runtimeArn,
    "--runtime-session-id",
    sessionId,
    "--payload",
    `fileb://${payloadPath}`,
    "--content-type",
    "application/json",
    "--accept",
    "application/json",
    "--region",
    region,
    responsePath,
  ];
  if (profile) args.splice(args.length - 1, 0, "--profile", profile);

  const result = spawnSync("aws", args, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(`AgentCore ${label} invocation failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(await readFile(responsePath, "utf8"));
};

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

try {
  const started = await invoke({ demo: true }, "start");
  if (!started.runId) throw new Error("AgentCore did not return a Foreman run ID.");

  let run;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const polled = await invoke({ action: "get", runId: started.runId }, `poll-${attempt}`);
    run = polled.run;
    if (run?.status === "awaiting_human" || run?.status === "completed" || run?.status === "failed") break;
    await sleep(2_000);
  }

  if (run?.status !== "awaiting_human") {
    throw new Error(`Expected a human decision, received ${run?.status ?? "no terminal state"}.`);
  }

  const decision = run.humanDecision;
  if (!decision) throw new Error("No pending escalation was returned.");

  const completed = await invoke(
    { action: "decide", runId: started.runId, decisionId: decision.id, optionId: "accept-change" },
    "decide",
  );
  const finalRun = completed.run;
  if (finalRun?.decision?.disposition !== "READY_TO_SHIP" || !finalRun.decision.evidenceComplete) {
    throw new Error(`Unexpected final release decision: ${finalRun?.decision?.disposition ?? "missing"}.`);
  }

  console.log(
    `AgentCore cloud smoke passed: ${finalRun.id} ${finalRun.decision.disposition} ` +
      `(${finalRun.evidence?.length ?? 0} evidence artifacts, ${finalRun.repairs?.length ?? 0} repair).`,
  );
} finally {
  await rm(workspace, { recursive: true, force: true });
}
