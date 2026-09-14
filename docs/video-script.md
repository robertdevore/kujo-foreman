# Five-minute demo script

Target runtime: 4:20. Hard maximum: 5:00.

## 0:00–0:18 — Hook

**Picture:** Candidate diff beside Foreman, status `UNVERIFIED`.

**Narration:** “AI can write a pull request in minutes. But somebody still has
to decide whether that code should actually ship. That's what Foreman does.”

## 0:18–0:42 — Product, not chat

**Picture:** New-run form. Choose **Run golden demo**.

**Narration:** “Foreman owns everything between code complete and safe to ship:
intent, diff analysis, verification, risk, bounded repair, human escalation,
and release evidence. This isn't a coding assistant or a pull-request chatbot.
It owns a release-readiness outcome.”

## 0:42–1:02 — Architecture

**Picture:** Architecture diagram; animate one highlight pass only.

**Narration:** “Strands Agents supplies the specialist graph, Bedrock cognition,
parallel routing, shared state, streaming, and AgentCore deployment. Foreman is
written in Kujo. Kujo supplies capabilities, policy, isolated execution,
deterministic gates, repair bounds, and the final evidence.”

## 1:02–1:45 — Real analysis and parallel work

**Picture:** Live run. Stage rail advances from Change to Spec. Verification and
Risk start together. Point to authority panel.

**Narration:** “This change adds configurable payment retries. Foreman reads the
actual Git range, quarantines repository text as untrusted data, reconstructs
explicit acceptance criteria, and fans out independent verification and risk work.
Notice each agent's authority. The analyst cannot write. The judge cannot touch
source. The recording uses the displayed managed-workspace executor; production
repository intake binds the same verification capability to Workcell.”

## 1:45–2:28 — Discover and repair

**Picture:** Checks complete. Documentation defect appears. Repair proposal,
exact before digest, one-file/one-line bound, then applied and rechecked.

**Narration:** “The ordinary suite passes, but Foreman finds a deterministic
documentation mismatch. That is eligible for autonomous repair: one exact
replacement, in the managed workspace, bound to the file digest. It applies the
repair and reruns affected evidence. If the file had changed, the proposal
would fail as stale.”

## 2:28–3:18 — Refuse to guess

**Picture:** `HUMAN DECISION REQUIRED` dominates center. Highlight old default
three, changed default five, and options.

**Narration:** “Then Foreman stops. The code silently changes the production
payment fallback from three attempts to five. Tests pass, but the requirement
never authorized new financial behavior. Foreman will not convert model
confidence into product policy. It asks one question, shows the evidence, and
recommends preserving the existing behavior. For this demo, the release owner
confirms that five attempts were intended but omitted from the issue.”

Choose **Authorize this change**.

## 3:18–3:50 — Continue and prove

**Picture:** Decision receipt and graph re-entry into Release Decision.

**Narration:** “The human choice is recorded against this run and exact option.
Because verification already covered the observed five-attempt behavior, Foreman
does not pretend another source patch occurred. It sends the newly authorized,
complete evidence set back to the deterministic Kujo release judge.”

## 3:50–4:12 — Payoff

**Picture:** Final `READY TO SHIP` result with real counts populated from state.

**Narration:** “Ready to ship. Every required check passed. The prompt-injection
fixture was ignored. One low-risk repair and one human decision are preserved.
No unresolved blocker remains.”

## 4:12–4:28 — Evidence and close

**Picture:** Evidence view, manifest and digest, then product mark.

**Narration:** “Foreman's answer is not ‘looks good to me.’ It is a checksummed
release-evidence package you can inspect and verify. The goal isn't to remove
humans from software engineering. It's to stop wasting human judgment on work
the machine can already prove.”

## Recording checklist

- Use a fresh demo workspace and real live events.
- Keep terminal text at readable size; no hidden cuts across failures.
- Show the AgentCore Runtime in `READY` state, then use the live run rather than a console-only claim.
- Do not state fixed test counts; narrate the values displayed by the run.
- Export 1080p, verify audio, and keep final duration below 5:00.
