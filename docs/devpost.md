# Devpost submission copy

## Submission fields

- **Title:** Kujo Foreman
- **Tagline:** AI writes code. Foreman decides whether it ships.
- **Track:** Professional Agents
- **Intended users:** Software engineers, release engineers, security engineers,
  and team leads who review changes produced by people or coding agents.
- **Repository:** `https://github.com/robertdevore/kujo-foreman`
- **Project image:** Upload `docs/foreman-live.png`.
- **Architecture diagram:** Upload `docs/architecture.png`.
- **Video:** Paste the public YouTube or Vimeo URL after upload.
- **Live demo:** Leave blank. The deployed AgentCore Runtime is intentionally
  private and IAM-authorized; the public repository includes a complete test build.
- **Built with:** Kujo, Strands Agents SDK, Amazon Bedrock, Amazon Nova Pro,
  Amazon Bedrock AgentCore Runtime, CloudWatch, TypeScript, React, Docker, and Git.
- **AWS Builder ID:** Enter the email address tied to the Builder ID.

## One-line description

Kujo Foreman is an autonomous release-readiness agent that verifies software
changes, repairs bounded low-risk defects, and escalates only decisions that
need human judgment.

## Testing instructions

1. Install Node.js 22+, Git, and the matching Kujo 1.4.0 binary from
   `https://github.com/kujolang/kujo/releases/tag/v1.4.0`.
2. Clone the public repository and run `npm run install:all`.
3. Run `npm run dev`, then run `npm run dev:web` in a second terminal.
4. Open `http://localhost:4173` and choose **Run golden demo**.
5. When Foreman stops at the payment-policy boundary, choose **Authorize this
   change**. The run must finish as `READY_TO_SHIP` with complete evidence.

The static `/preview` route is labeled and is not the working demonstration.

## Inspiration

AI can write a pull request in minutes. A developer still has to determine
whether it satisfies the request, passes the right checks, preserves important
boundaries, and has enough evidence to ship.

That work means reconstructing intent, understanding a diff, choosing useful
checks, investigating risk, repairing what is unambiguous, and stopping when a
product or security decision belongs to a human. Existing tools cover pieces of
the process. Foreman owns the handoff from code complete to a release decision.

Foreman starts where coding agents stop.

## What it does

Give Foreman a local Git change set and its intended outcome. It analyzes the
change, turns intent into explicit acceptance criteria, constructs an adaptive
verification plan, and runs independent verification and risk work in
parallel. Checks execute through bounded Kujo capabilities; production binds
that Ability to Workcell
isolation. Results become typed, checksummed evidence rather than a prose claim.

When Foreman finds an exact low-risk defect, its Repair Agent can change only
a Foreman-managed workspace, within deterministic file, line, time, and iteration
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
repair, re-evaluation, or escalation. The deployed private runtime uses Amazon
Nova Pro through Bedrock on AgentCore Runtime, with CloudWatch logs and
structured lifecycle events.

Kujo capability profiles give each operation a stable identity, declared effect,
scope, and receipt. Each specialist sees only its profile. Workcell defines the
production isolation contract; the submitted demo uses an explicitly labeled
managed Git workspace. Kujo Spec semantics shape acceptance criteria, and Kujo
Eval's suite format measures the seven expected release outcomes. Other Kujo
tools remain optional repository-specific adapters rather than decorative calls.

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
- A deployed AgentCore Runtime whose real cloud smoke ends in a checksummed
  `READY_TO_SHIP` decision.

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
