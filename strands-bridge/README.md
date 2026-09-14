# Foreman Strands bridge

This package is deliberately narrow: Strands Agents SDK 1.17 owns specialist-agent orchestration and HTTP/SSE transport; Kujo owns repository analysis, specification, verification, policy, release judgment, and evidence.

The native Strands `Graph` is `intake → change analysis → specification → (verification ‖ risk) → repair proposal → conditional apply → re-evaluate → release decision`. The repair loop is structurally unrolled and capped at two iterations, avoiding an unbounded model-controlled cycle. In Bedrock mode every cognitive specialist is a real Strands `Agent` with one fixed-scope `FunctionTool`; repair routing and release judgment stay deterministic Kujo-backed invokable nodes. The shared invocation state contains run identity and transport context, while repository content is explicitly untrusted data. In `offline` mode the cognitive nodes also become deterministic Kujo-backed invokable nodes for tests and no-network demonstrations.

Every capability call is checked against Kujo's role policy before execution. Repair proposals and writes remain Kujo-owned: the bridge calls digest-bound `repair-propose` and `repair-apply`, permits automatic writes only in a Foreman-managed isolated demo workspace, and always re-runs the repository verification plan before judging release readiness.

```sh
npm install
FOREMAN_MODE=offline npm start
# production path
AWS_REGION=us-east-1 FOREMAN_MODE=bedrock FOREMAN_BEDROCK_MODEL=amazon.nova-pro-v1:0 npm start
```

`KUJO_BIN` may point to a Kujo executable. Processes are always spawned as executable-plus-argv with `shell: false`. State, replayable event logs, and Kujo evidence packages are kept under `../.foreman/`. The SSE endpoint honors `Last-Event-ID`; no progress event is timer-simulated.

API:

- `POST /api/runs` accepts `{repository, ref, compareRef, intent}` or `{demo:true}`.
- `GET /api/runs/:id`
- `GET /api/runs/:id/events`
- `POST /api/runs/:id/stop`
- `POST /api/runs/:id/decisions/:decisionId` with `{optionId}`
- `GET /api/runs/:id/evidence/:evidenceId`

The same process exposes AgentCore Runtime's HTTP contract: `GET /ping` and `POST /invocations`. An invocation accepts the normal start-run body and returns its durable Foreman run ID. When AgentCore supplies `X-Amzn-Bedrock-AgentCore-Runtime-Session-Id`, the bridge treats it as an opaque correlation value and echoes it; Foreman persistence is keyed by run ID, so multiple assessments do not accidentally share agent state. AgentCore callers must provide a runtime session ID meeting the service's current minimum-length requirement (33 characters); local calls may omit it.

Offline mode is explicit and never selected as a silent Bedrock fallback.
