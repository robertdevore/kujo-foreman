# Agents for Humans: Giving Autonomous Agents Tools Without Unlimited Authority

An agent should not receive “a computer.” It should receive the smallest set of
named operations required for its job.

Foreman uses Kujo Ability's contract as that semantic layer. Each checked-in
capability has a stable ID, input and output schemas, declared effects, and
idempotency rules. The current Strands bridge calls those capabilities through
a local, argument-safe Kujo process binding. MCP remains a compatible future
transport, not a claimed call on the demo path.

Profiles make the boundary visible. The Change Analyst can read repository and
Git data, but cannot write. Verification runs allowlisted checks in the labeled
managed workspace and cannot mutate production. Repair can write only within
file, line, time, and iteration bounds. The release judge can read evidence and
nothing else. The production repository-intake contract binds execution to
Workcell.

Effect declarations are not a sandbox. This distinction matters. Ability says
that an operation writes a worktree or starts an external process. Workcell
enforces the actual environment: clean disposable worktree, no network by
default, bounded CPU and memory, dropped capabilities, bounded output, and a
verified receipt.

Repair adds another layer. A proposal binds an exact path, expected file
digest, deterministic rule, before/after text, and change budget. A stale file
fails. A traversal path fails. Human approval can authorize a high-consequence
semantic choice, but cannot override containment.

This design is less magical than a general shell tool. That is the point.
Professional autonomy becomes credible when every useful power has a name, an
effect, an owner, and evidence.
