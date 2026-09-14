import type { ForemanRun } from "../lib/types";

const dispositionLabels = {
  UNVERIFIED: "Unverified",
  READY_TO_SHIP: "Ready to ship",
  READY_WITH_NOTES: "Ready with notes",
  BLOCKED: "Blocked",
  HUMAN_DECISION_REQUIRED: "Human decision required",
};

export function Verdict({ run }: { run: ForemanRun }) {
  const decision = run.decision;
  const totalVerification = run.verifications.length;
  const passedVerification = run.verifications.filter((item) => item.status === "passed").length;
  return (
    <section className={`verdict verdict--${decision.disposition.toLowerCase()}`} aria-labelledby="verdict-title">
      <div className="verdict-top"><span className="verdict-symbol" aria-hidden="true">{decision.disposition === "READY_TO_SHIP" ? "✓" : decision.disposition === "BLOCKED" ? "×" : decision.disposition === "HUMAN_DECISION_REQUIRED" ? "!" : "○"}</span><div><p className="eyebrow">RELEASE DISPOSITION</p><h2 id="verdict-title">{dispositionLabels[decision.disposition]}</h2></div></div>
      <p className="verdict-rationale">{decision.rationale}</p>
      <dl className="verdict-metrics">
        <div><dt>Required checks</dt><dd>{decision.acceptanceCriteria.satisfied} / {decision.acceptanceCriteria.total}</dd></div>
        <div><dt>Verification</dt><dd>{passedVerification} / {totalVerification}</dd></div>
        <div><dt>Security blockers</dt><dd>{decision.blockers}</dd></div>
        <div><dt>Automatic repairs</dt><dd>{run.repairs.filter((repair) => repair.status === "verified").length}</dd></div>
        <div><dt>Evidence completeness</dt><dd>{decision.evidenceComplete ? "Complete" : "Incomplete"}</dd></div>
      </dl>
      <div className="verdict-footer"><span>FOREMAN RUN #{run.id}</span><span>{new Date(decision.timestamp).toLocaleString()}</span></div>
    </section>
  );
}
