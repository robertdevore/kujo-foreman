import type { Verification } from "../lib/types";

const statusMark = { queued: "○", running: "◉", passed: "✓", failed: "×", blocked: "!" };
const laneLabels = { build: "BUILD", test: "TEST", quality: "QUALITY", security: "RISK", behavior: "BEHAVIOR" };

export function VerificationLanes({ verifications }: { verifications: Verification[] }) {
  return (
    <section className="panel" aria-labelledby="verification-title">
      <div className="panel-heading"><div><p className="eyebrow">PARALLEL EXECUTION</p><h2 id="verification-title">Verification lanes</h2></div><span className="count">{verifications.length}</span></div>
      {verifications.length === 0 ? <p className="empty">No verification jobs have been scheduled.</p> : (
        <ul className="lane-list">
          {verifications.map((item) => (
            <li key={item.id} className={`lane lane--${item.status}`}>
              <span className="lane-mark" aria-hidden="true">{statusMark[item.status]}</span>
              <span className="lane-tag">{laneLabels[item.lane]}</span>
              <span className="lane-main"><b>{item.name}</b><small>{item.summary ?? item.command ?? item.status}</small></span>
              <span className="lane-duration">{item.durationMs ? `${(item.durationMs / 1000).toFixed(1)}s` : "—"}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
