import { foremanApi } from "../lib/api";
import { useRun } from "../lib/use-run";
import { CapabilityBoundary } from "./CapabilityBoundary";
import { EvidenceView } from "./EvidenceView";
import { HumanDecisionPanel } from "./HumanDecisionPanel";
import { StageRail } from "./StageRail";
import { Verdict } from "./Verdict";
import { VerificationLanes } from "./VerificationLanes";

export function RunDashboard({ id, preview, evidence = false }: { id: string; preview: boolean; evidence?: boolean }) {
  const { state, dispatch } = useRun(id, preview);
  const run = state.run;
  if (!run && state.connection === "error") return <div className="page page--narrow"><div className="load-error"><p className="eyebrow">RUN UNAVAILABLE</p><h1>Foreman could not load this assessment.</h1><p>{state.error}</p><a className="sk-button" href="/new">Start another run</a></div></div>;
  if (!run) return <div className="page loading-state" role="status"><span className="loader" aria-hidden="true" /><p>Loading release evidence…</p></div>;
  if (evidence) return <EvidenceView run={run} />;
  const currentRun = run;

  async function resolveDecision(optionId: string) {
    const decision = currentRun.humanDecision;
    if (!decision || preview) return;
    const updated = await foremanApi.resolveDecision(currentRun.id, decision.id, optionId);
    dispatch({ type: "hydrate", run: updated });
  }

  async function stopRun() {
    if (preview || !window.confirm("Stop this Foreman run? Completed evidence will remain available.")) return;
    const updated = await foremanApi.stopRun(currentRun.id);
    dispatch({ type: "hydrate", run: updated });
  }

  return (
    <div className="page run-page">
      {preview && <div className="fixture-banner" role="status"><b>PREVIEW FIXTURE</b><span>Static sample data for product evaluation. No repository checks were executed.</span><a href="/new">Start a real run</a></div>}
      <header className="run-header">
        <div><div className="run-kicker"><span className={`live-dot live-dot--${state.connection}`} aria-hidden="true" /><span>{preview ? "STATIC PREVIEW" : state.connection === "live" ? "LIVE EVIDENCE STREAM" : state.connection.toUpperCase()}</span><span>RUN #{run.id}</span></div><h1>{run.repository}</h1><p><code>{run.ref}</code>{run.compareRef && <> against <code>{run.compareRef}</code></>}</p></div>
        <div className="run-actions"><a className="sk-button sk-button--secondary" href={preview ? "/preview/evidence" : `/runs/${run.id}/evidence`}>View evidence</a>{!preview && run.status === "running" && <button className="sk-button sk-button--secondary" type="button" onClick={stopRun}>Stop run</button>}</div>
      </header>

      <div className="run-grid">
        <aside className="run-sidebar"><StageRail stages={run.stages} /><div className="authority-card"><p className="eyebrow">CURRENT AUTHORITY</p><b>Managed workspace</b><p>No production access. Writes limited to Foreman-owned demo workspaces.</p></div></aside>
        <div className="run-content">
          <section className="activity-strip" aria-live="polite"><span className="activity-pulse" aria-hidden="true" /><div><small>CURRENT</small><p>{run.currentActivity ?? "Awaiting the next verified event"}</p></div><span className={`run-status run-status--${run.status}`}>{run.status.replaceAll("_", " ")}</span></section>
          <section className="change-summary"><div><p className="eyebrow">SOURCE INTENT</p><p>{run.intent}</p></div><dl><div><dt>Repairs</dt><dd>{run.repairs.length}</dd></div><div><dt>Evidence</dt><dd>{run.evidence.length}</dd></div><div><dt>Unknowns</dt><dd>{run.decision.blockers}</dd></div></dl></section>
          <div className="dashboard-columns"><VerificationLanes verifications={run.verifications} /><CapabilityBoundary capabilities={run.capabilities} /></div>
          {run.repairs.length > 0 && <section className="repair-panel"><div className="repair-icon" aria-hidden="true">↻</div><div><p className="eyebrow">BOUNDED AUTO-REPAIR</p><h2>{run.repairs[0].path}</h2><p>{run.repairs[0].reason}</p></div><span className={`repair-status repair-status--${run.repairs[0].status}`}>{run.repairs[0].status}</span></section>}
          {run.humanDecision && <HumanDecisionPanel decision={run.humanDecision} disabled={preview} onResolve={resolveDecision} />}
          <Verdict run={run} />
        </div>
      </div>
    </div>
  );
}
