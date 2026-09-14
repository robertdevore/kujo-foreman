# Architecture

Foreman is a Kujo application with a narrow TypeScript boundary for Strands
Agents and HTTP/SSE transport.

```text
Git / UI / API
      │
      ▼
AgentCore-compatible Strands bridge
      │  native Graph, Bedrock agents, lifecycle hooks, streaming
      ▼
change → specification → verification ─┐
                          risk ─────────┤ AND barrier
                                       ▼
                              Kujo release judge
                              │       │       │
                            ready   repair  escalate
                                      │       │
                                      └── re-evaluate
      │
      ▼
Kujo Ability profiles → MCP / local bindings → execution adapter
      │                                      │
      ├─ Scout / PatchBrief / Spec / Eval    ├─ tests / build / lint
      ├─ Fence / ShipCheck / RunLedger       └─ local managed workspace / Workcell production binding
      └─ Watchdog metadata
      │
      ▼
Checksummed release evidence + live SSE projection
```

The full rendered diagram is available as [SVG](architecture.svg) and
[PNG](architecture.png).

## Why this boundary

Strands owns cognition and orchestration: specialist agents, the native graph,
parallel scheduling, conditional routing, shared invocation state, model
provider, lifecycle hooks, streaming, and telemetry.

Kujo owns execution and truth: capability contracts, repository analysis,
policy, exact repairs, deterministic verification, the fail-closed release
judge, and evidence integrity. The model may interpret evidence, but it cannot
manufacture a passing exit code or bypass the judge.

The TypeScript Graph has AND-semantics for nodes with multiple incoming edges,
which makes the verification/risk fan-in explicit. The Kujo judge still checks
evidence completeness independently, because orchestration topology must not
be the only release-safety control.

## Release dispositions

| Disposition | Exact meaning |
| --- | --- |
| `READY_TO_SHIP` | Every required gate passed, evidence is complete, and no open risk or note remains. |
| `READY_WITH_NOTES` | Every required gate passed and evidence is complete; only non-blocking advisory notes remain. |
| `BLOCKED` | A required check failed, evidence is missing/conflicting, the project is unsupported, or a high risk remains without a human-decision shape. |
| `HUMAN_DECISION_REQUIRED` | Machine-verifiable work is complete enough to isolate a high-consequence ambiguity, but available authority cannot resolve it safely. |

These values are decided in Kujo, not natural-language model output.

## State and evidence

`foreman.run/v1` stores project identity, trusted operator intent, untrusted
change data, criteria, verification plan/results, risks, repairs, decisions,
evidence, policy bounds, and release disposition. Every artifact carries an
identity, producer, timestamp, source, status, and digest.

Events are append-only `foreman.event/v1` records with a monotonic sequence.
The browser applies them idempotently and reconnects with `Last-Event-ID`.
Raw chain-of-thought is never emitted.
