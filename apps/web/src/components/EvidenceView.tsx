import type { ForemanRun } from "../lib/types";
import { foremanApi } from "../lib/api";

export function EvidenceView({ run }: { run: ForemanRun }) {
  return (
    <div className="page evidence-page">
      <div className="backline"><a href={run.preview ? "/preview" : `/runs/${run.id}`}>← Run overview</a><span>Run #{run.id}</span></div>
      <header className="evidence-header"><div><p className="eyebrow">IMMUTABLE RELEASE RECORD</p><h1>Evidence timeline</h1><p>What Foreman observed, who produced it, and which conclusions depend on it.</p></div><span className="evidence-score">{run.evidence.filter((item) => item.status === "complete").length}<small>complete artifacts</small></span></header>
      {run.preview && <div className="fixture-banner" role="status"><b>PREVIEW FIXTURE</b><span>Static sample data for product evaluation. No checks were executed.</span></div>}
      <ol className="evidence-timeline">
        {run.evidence.map((item, index) => (
          <li key={item.id}>
            <div className={`timeline-node timeline-node--${item.status}`}>{String(index + 1).padStart(2, "0")}</div>
            <article><div className="evidence-meta"><span className="eyebrow">{item.kind} / {item.id}</span><span>{new Date(item.timestamp).toLocaleTimeString()}</span></div><h2>{item.title}</h2><p>{item.summary}</p><dl><div><dt>Producer</dt><dd>{item.producer}</dd></div><div><dt>Status</dt><dd>{item.status}</dd></div><div><dt>Supports</dt><dd>{run.decision.evidenceIds?.includes(item.id) ? "Release decision" : "Supporting analysis"}</dd></div></dl>{!run.preview && <a className="text-link" href={item.uri ?? foremanApi.evidenceUrl(run.id, item.id)}>Open artifact →</a>}</article>
          </li>
        ))}
      </ol>
    </div>
  );
}
