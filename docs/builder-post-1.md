# Agents for Humans: Building Kujo Foreman with Strands Agents

AI coding changed the bottleneck. Generating a patch is fast; reconstructing
its intent, verifying its behavior, evaluating risk, and deciding whether it
should ship still consumes expert time.

Kujo Foreman treats that interval as an owned outcome. Its Strands Graph starts
with change analysis and specification, then runs verification and risk in
parallel. An AND-semantics fan-in prevents the judge from running before both
paths finish. Conditional edges route to release, bounded repair and
re-evaluation, or human escalation. Shared invocation state carries typed
artifact references instead of copying large prose between specialists.

The model is valuable where interpretation is unavoidable: inferring affected
systems, finding implicit requirements, identifying useful targeted checks,
and compressing an ambiguity into a decision. It is deliberately not trusted
with test exit codes, repair-loop bounds, evidence completeness, or final gate
semantics. Those remain deterministic Kujo contracts.

This produces an important architectural split:

- Strands owns cognition, graph orchestration, the Bedrock model boundary,
  streaming, and lifecycle events.
- Kujo owns controlled execution, policy, deterministic verification, and
  evidence integrity.

The graph is not decorative. It makes parallel work observable, supplies real
stop conditions, and exposes exactly why the run entered repair or escalation.
The web interface consumes those lifecycle events directly rather than drawing
a synthetic progress bar.

The result is an agent that can explain its work without exposing hidden
reasoning. Users see actions, capabilities, evidence, decisions, duration, and
disposition. That is the operational vocabulary professional agents need.
