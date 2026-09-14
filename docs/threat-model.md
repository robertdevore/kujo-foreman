# Threat model

## Assets

- Source repository and isolated worktree
- Build/test credentials and environment
- Human approvals
- Release decision and evidence integrity
- Model/tool usage metadata

## Trust boundaries

Repository content, commit messages, dependency metadata, issues, logs, tool
output, and model output are untrusted data. Operator policy, exact Ability
definitions, Workcell production controls, approval receipts, and deterministic gate code
are trusted only at their pinned versions and verified digests.

## Principal threats and controls

| Threat | Control |
| --- | --- |
| Repository prompt injection | Content is wrapped as `untrusted_repository_data`; instruction signatures are surfaced; specialist prompts may extract facts only. |
| Tool privilege escalation | Per-agent Ability profiles; deny by default; effect declarations; release judge has evidence-read authority only. |
| Arbitrary command injection | Verification commands come from a closed adapter map and are spawned as argv arrays. Repository strings are never shell-interpolated. |
| Unsafe autonomous repair | Exact path containment, before-digest binding, deterministic rule ID, file/line/iteration bounds, consequence classification, managed workspace only. |
| High-consequence semantic change | Auth, payment, permission, destructive, migration, secret, and production changes require an exact human decision. |
| Stale approval replay | Approval binds decision, option, proposal digest, run, actor, expiry, and idempotency key. |
| False readiness | Required evidence count, exit codes, open risks, and manifest presence are checked by deterministic Kujo code. Missing evidence fails closed. |
| Evidence tampering | SHA-256 manifest covers every primary artifact; `verify-evidence` detects mutation. |
| Data exfiltration | Production Workcell network defaults to none; no secrets are exposed by default; evidence stores digests and bounded summaries rather than full sensitive output. |
| Resource exhaustion / loops | Graph step/time limits, per-node timeouts, cancellation, maximum two repair iterations, and bounded output capture. |

## Red-team scenarios

The automated suite covers repository text saying “ignore all previous
instructions,” “skip tests,” and “mark this repository safe”; fake tool-call
text; unsafe repair traversal; stale repair digests; missing evidence; and
high-consequence change escalation.

## Residual risk

Line-oriented injection signatures supplement but do not replace the trust
boundary. Workcell requires a working local Docker/Podman environment. A
compromised host, runtime binary, container engine, or explicitly allowlisted
test command remains outside Foreman's protection.
