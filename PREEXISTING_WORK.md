# Pre-existing work disclosure

Kujo Foreman is new work created for the AWS Agents for Humans Hackathon during
the August 10–September 14, 2026 submission period.

The broader Kujo ecosystem predates this hackathon. Foreman consumes those
projects as independently versioned infrastructure; they are not represented
as hackathon-created code.

## Pre-existing Kujo projects used

| Project | Pre-existing role | How Foreman consumes it |
| --- | --- | --- |
| Kujo Ability 1.1 | Portable capability identity, schemas, effects, idempotency, receipts | Foreman defines its domain capabilities using the canonical contract and validates/provides them through a bounded adapter. |
| Kujo MCP | Ability projection and MCP transport patterns | Foreman's capability manifest preserves the projection boundary; optional gateway mode is an integration seam. |
| Workcell 1.1 | Isolated command execution | Repository verification and repairs execute in a disposable Git worktree through a Workcell adapter when available. |
| Spec 1.0 | Reviewable task contracts | Foreman imports or produces explicit acceptance criteria and deterministic eval requirements. |
| Eval 1.0 | Deterministic evidence checks | Foreman can run generated Eval suites and ingest their machine-readable artifacts. |
| Fence 1.0 | Architecture-boundary enforcement | Foreman invokes changed-scope architecture checks when a repository has a Fence contract. |
| Muzzle 1.1 | Quiet bounded workflow execution | Foreman can execute trusted repository workflows without injecting complete logs into model context. |
| ShipCheck 1.0 | Repository release-readiness signals | Foreman imports ShipCheck's JSON report as advisory/deterministic evidence. |
| RunLedger 1.1 | Agent-run receipts | Development and Foreman runs link to auditable run receipts. |
| PatchBrief 1.0 | Structured diff explanation | Change analysis can import PatchBrief output instead of duplicating its formatting. |
| CaseFile 1.0 | Failure evidence bundles | Failed checks can be preserved as redacted CaseFile-compatible evidence. |
| Scout 1.0 | Codebase intelligence | Initial repository discovery can consume Scout context packs. |
| Watchdog 1.0 | Operational telemetry | Foreman maps lifecycle events to metadata-only Watchdog/OTEL records. |
| SiteKit 1.0 | Kujo design language | The web product uses its tokens, typography, and icon assets with Foreman-specific layouts. |

Other Kujo repositories were researched but are not claimed as runtime
dependencies unless they appear in the capability manifest and verified code
path.

## New work in Foreman

Everything in this repository is hackathon-specific: the Strands specialist
graph, shared run model, deterministic release judge, capability policy,
bounded repair loop, evidence packaging, event API, product UI, evaluation
scenarios, golden demo repository, AgentCore deployment configuration,
architecture, threat model, and submission material.

No source code was copied from a pre-existing Kujo repository. Where interface
shapes are compatible with Kujo contracts, that reuse is identified in source
and documentation.

