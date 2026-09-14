# Kujo repository audit

The local ecosystem was audited from source, manifests, tests, docs, current
branches, and tags before Foreman architecture was fixed.

## Reused critical path

| Component | Verified current role | Foreman use |
| --- | --- | --- |
| Kujo 1.4 source | VM/CLI and deny-by-default native capability flags | Direct application runtime and deterministic release contracts |
| Ability 1.1 | Stable identity, schemas, effects, policy, approvals, idempotency, receipts | Canonical identities and semantics for the checked-in catalog and least-authority profiles |
| Spec 1.0.1 | Acceptance criteria, risks, approval points, deterministic exports | Semantics for the specification capability and artifact |
| Eval 1.0 | Deterministic v2 suites and outcome reports | Suite format for seven fail-closed scenarios |
| Workcell 1.1 | Docker/Podman isolation with receipts and resource bounds | Validated production contract; not falsely claimed as the local demo executor |
| SiteKit 1.0 | Framework-neutral Kujo tokens, CSS, font, icons | Vendored product visual foundation |

The audit also found stable identities for Scout, Scent, PatchBrief,
ChangeBucket, ShipCheck, Fence, RunLedger, Dispatch, RAG, and Watchdog. Foreman
keeps those as optional repository adapters. Merely listing an identity in a
role profile is not reported as a runtime invocation.

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

- The development host's global Kujo may lag the pinned version. CI and the
  AgentCore image download Kujo 1.4.0 and verify its published SHA-256.
- Workcell rejects dirty repositories; Foreman evaluates a clean committed
  snapshot or isolated worktree.
- Ability effects are declarations. Workcell enforces the actual side-effect
  boundary.
- The full AgentCore container and offline golden path passed in Docker. The
  repository-under-test still uses the explicitly labeled managed Git workspace;
  nested Workcell execution remains the production adapter contract.
