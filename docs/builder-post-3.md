# Agents for Humans: Turning AI-Written Code Into Release Evidence

“The agent is confident” is not release evidence.

Foreman builds a typed evidence package that answers what was requested, what
changed, what ran, what failed, what was repaired, what needed human judgment,
what risk remains, and why the final disposition follows.

Every artifact has an ID, producer, timestamp, source, status, structured data,
and digest. Command output is retained outside model context; the model sees a
bounded summary and evidence reference. The final package contains the run,
decision, verification results, risk findings, repairs, human decisions, a
human summary, and a SHA-256 manifest. A separate verifier detects mutation.

The release judge has four exact outcomes. `READY_TO_SHIP` means every required
gate passed, evidence is complete, and no note or open risk remains.
`READY_WITH_NOTES` still requires complete passing gates. `BLOCKED` covers
failed or missing evidence. `HUMAN_DECISION_REQUIRED` means the machine has
isolated a high-consequence ambiguity that available authority cannot answer.

That last state is a feature. Instead of dumping an agent transcript, Foreman
creates one decision packet: the question, stop reason, evidence, mutually
exclusive options, recommendation, and confidence. After the human chooses,
the exact choice becomes evidence and re-verification resumes.

False confidence is the primary failure metric. Blocking a safe patch is
inconvenient; passing an unsafe patch breaks the product. Evidence-first design
makes that asymmetry explicit in code.

