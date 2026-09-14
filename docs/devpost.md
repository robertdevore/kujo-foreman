# Devpost submission copy

## One-line description

Kujo Foreman is an autonomous release-readiness agent that verifies software
changes, repairs bounded low-risk defects, and escalates only decisions that
need human judgment.

## Inspiration

AI can write a pull request in minutes. That does not answer whether the pull
request should ship.

The expensive part is moving: reconstructing intent, understanding a diff,
choosing meaningful checks, executing them safely, investigating risk,
repairing what is unambiguous, rerunning the right evidence, and stopping when
a product or security decision belongs to a human. Most tools handle one slice
of that work. Nobody owns the outcome.

Foreman starts where coding agents stop.

## What it does

Give Foreman a local Git change set and its intended outcome. It analyzes the
change, turns intent into explicit acceptance criteria, constructs an adaptive
verification plan, and runs independent verification and risk work in
parallel. Checks execute through bounded Kujo capabilities; production binds
that Ability to Workcell
isolation. Results become typed, checksummed evidence rather than a prose claim.

When Foreman finds an exact low-risk defect, its Repair Agent can change only
an isolated worktree, within deterministic file, line, time, and iteration
bounds. It then reruns the affected checks. Auth, payment, permission,
destructive-data, migration, secret, and production-policy changes cannot be
guessed. Foreman creates a compact decision packet, pauses, and continues only
after an exact human choice.

The final Kujo release judge returns one of four meanings:
`READY_TO_SHIP`, `READY_WITH_NOTES`, `BLOCKED`, or
`HUMAN_DECISION_REQUIRED`. Missing evidence always fails closed.

## How we built it

Foreman itself is written in Kujo. Kujo owns repository analysis, typed run
artifacts, capability policy, deterministic verification contracts, bounded
repair, final judgment, and release-evidence integrity.

A narrow TypeScript service uses Strands Agents substantially and visibly. A
native Strands Graph coordinates specialist agents, uses a real parallel
verification/risk fan-out with AND-semantics fan-in, shares invocation state,
streams lifecycle events, enforces step and time bounds, and routes through
repair, re-evaluation, or escalation. The official deployment path uses Amazon
Bedrock models in AgentCore Runtime with OpenTelemetry/CloudWatch
observability.

Kujo Ability gives every operation a stable identity, JSON schema, effect
declaration, idempotency contract, and receipt. Each specialist sees only its
profile. Workcell is the production container boundary; the submitted local
demo uses an explicitly labeled managed Git workspace. Spec expresses acceptance
criteria, Eval checks outcomes, Scout supplies repository intelligence,
PatchBrief explains diffs, Fence checks architecture, ShipCheck checks release
hygiene, RunLedger correlates attempts, CaseFile preserves difficult failures,
and Watchdog can receive metadata-only lifecycle events.

The UI is a focused release-control surface built with React and the Kujo
SiteKit visual system. It renders real graph events, current authority,
verification lanes, repair evidence, human decisions, and the final artifact;
it is not a chatbot.

## Challenges we ran into

The hardest problem was keeping model judgment useful without letting it become
the release gate. Our answer was a two-key design: Strands interprets and
coordinates, while Kujo requires deterministic evidence completeness before a
release can pass.

The second challenge was capability truth. Declaring a tool “safe” is not
enforcement. We separated portable Ability effects from Workcell's production
execution boundary, bound repairs to exact file digests, and made human
approval incapable of bypassing path containment.

The third was human escalation. A long agent transcript is not a product. We
designed escalation as a small decision object containing the decision, stop
reason, evidence, options, recommendation, and confidence.

## Accomplishments that we're proud of

- A new Kujo-native application with a substantive Strands multi-agent graph,
  not a giant wrapper function.
- A fail-closed release judge that cannot turn incomplete evidence into
  confidence.
- Bounded repair with exact-digest stale-write protection and mandatory
  re-verification.
- Repository prompt-injection tests that keep source text in the data plane.
- A real checksummed release-evidence package and integrity verifier.
- A polished live interface that makes authority and autonomous work visible.
- A deterministic golden change that includes success, repair, refusal,
  human input, re-evaluation, and payoff.

## What we learned

Agent safety gets clearer when “what an operation means” and “where it may run”
are separate contracts. Ability describes identity and effects; Workcell
enforces execution. Neither substitutes for the other.

Parallel agents also need a deterministic barrier. A graph edge says when work
may run. It does not prove that the resulting evidence is sufficient. The
release judge must validate the artifact set again.

Finally, good human-in-the-loop design is subtraction. The useful unit is not a
conversation. It is one unresolved decision with enough evidence to answer it.

## What's next

Foreman can become a provider-neutral release-control layer between coding
agents and CI/CD. Next steps are hosted repository adapters, signed policy
distribution, remote Workcell providers after their contracts stabilize,
team approval routing, richer language-specific verification planners, and
organization-calibrated evaluation sets that measure false-pass risk over time.

## Pre-existing work

The Kujo ecosystem predates this hackathon and is used as disclosed
in `PREEXISTING_WORK.md`. The Foreman product, graph, domain capabilities,
state, policy, judge, UI, demo, evaluations, deployment artifacts, and
submission materials are new hackathon work.
