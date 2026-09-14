# Kujo repository audit

The local ecosystem was audited from source, manifests, tests, docs, current
branches, and tags before Foreman architecture was fixed.

## Reused critical path

| Component | Verified current role | Foreman use |
| --- | --- | --- |
| Kujo 1.4 source | VM/CLI and deny-by-default native capability flags | Foreman application runtime and deterministic contracts |
| Ability 1.1 | Stable identity, schemas, effects, policy, approvals, idempotency, receipts | Canonical domain capability definitions and least-authority profiles |
| MCP 1.2 source | Ability projection and a real `kujo-cmd` tool catalog | Existing execution bridge and canonical Kujo tool identities |
| Workcell 1.1 | Docker/Podman isolation with receipts, verification, manifests, resource/network bounds | Contained execution boundary |
| Spec 1.0.1 | Acceptance criteria, risks, approval points, deterministic exports | Specification artifact format |
| Eval 1.0 | Deterministic v2 suites, 27 checks, policy, reports, integrity manifests | Outcome verification inside Workcell |
| Scout 1.0 | Repository structure, dependencies, routes, security signals | Adaptive initial inspection |
| PatchBrief 1.0.1 | Working-tree diff summary | Local change explanation; Foreman adds commit-range support |
| Fence 1.0 source | Deterministic architecture boundary checks | Conditional architecture gate |
| ShipCheck 1.0 | Release metadata and hygiene only | Advisory hygiene gate, never the release judge |
| RunLedger 1.1 | Top-level attempt, usage, cost, and correlation receipts | Development/run correlation |
| CaseFile 1.0 | Redacted failure bundles | Select difficult failure evidence |
| Watchdog 1.0.1 | Native metadata telemetry and local dashboard | Optional correlated local sink |
| SiteKit 1.0 | Framework-neutral Kujo tokens, CSS, font, icons | Vendored product visual foundation |

The existing MCP catalog already defines Scout, Scent, PatchBrief,
ChangeBucket, ShipCheck, Fence, Spec, Eval, RunLedger, Dispatch, RAG, and
Watchdog Abilities. Foreman preserves those identities rather than inventing
parallel wrappers.

## Deliberate exclusions

- Dispatch and Agents SDK are not the primary orchestrator; Strands must remain
  visible and substantive.
- Ability Gateway currently exposes controlled-beta fixtures rather than
  arbitrary customer handlers, so it is not Foreman's execution plane.
- Concord is experimental, Workcell remote providers are alpha, and Leash is
  not mature enough for the golden path.
- ShipCheck does not run tests and cannot certify a release.
- Muzzle is useful for trusted log compression, not isolation.

## Constraints found

- The globally installed Kujo and release binary report 1.3.1; the local debug
  runtime reports 1.4.0. Foreman requires and documents the latter until 1.4 is
  installed globally.
- Workcell rejects dirty repositories; Foreman evaluates a clean committed
  snapshot or isolated worktree.
- Ability effects are declarations. Workcell enforces the actual side-effect
  boundary.
- The local Docker daemon was unavailable during this build, so offline
  Workcell validation can pass but a container execution cannot be claimed.

