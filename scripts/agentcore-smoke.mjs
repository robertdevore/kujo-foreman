import assert from "node:assert/strict";

const baseUrl = process.env.FOREMAN_SMOKE_URL ?? "http://127.0.0.1:8080";
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function json(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  if (!response.ok) throw new Error(`${init?.method ?? "GET"} ${path} returned ${response.status}: ${await response.text()}`);
  return response.json();
}

async function waitFor(path, predicate, timeoutMilliseconds = 120_000) {
  const deadline = Date.now() + timeoutMilliseconds;
  let value;
  while (Date.now() < deadline) {
    try {
      value = await json(path);
      if (predicate(value)) return value;
    } catch {
      // The container may still be starting.
    }
    await delay(500);
  }
  throw new Error(`timed out waiting for ${path}; last response: ${JSON.stringify(value)}`);
}

await waitFor("/ping", (value) => value.status === "Healthy", 60_000);
const started = await json("/invocations", {
  method: "POST",
  headers: { "content-type": "application/json", "x-amzn-bedrock-agentcore-runtime-session-id": "foreman-ci-smoke" },
  body: JSON.stringify({ demo: true }),
});
assert.match(started.runId, /^frm-[0-9a-f]{8}$/);

const awaiting = await waitFor(`/api/runs/${started.runId}`, (run) => run.status === "awaiting_human" || run.status === "failed");
assert.equal(awaiting.status, "awaiting_human", awaiting.currentActivity);
assert.equal(awaiting.decision.disposition, "HUMAN_DECISION_REQUIRED");
assert.ok(awaiting.verifications.length >= 2);
assert.ok(awaiting.verifications.every((check) => check.status === "passed"));
assert.equal(awaiting.repairs.length, 1);
assert.equal(awaiting.repairs[0].status, "verified");
assert.ok(awaiting.humanDecision?.id);

const completed = await json(`/api/runs/${started.runId}/decisions/${awaiting.humanDecision.id}`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ optionId: "accept-change" }),
});
assert.equal(completed.status, "completed");
assert.equal(completed.decision.disposition, "READY_TO_SHIP");
assert.equal(completed.decision.evidenceComplete, true);
assert.ok(completed.evidence.length >= 7);

process.stdout.write(`AgentCore container smoke passed: ${completed.id} READY_TO_SHIP\n`);
