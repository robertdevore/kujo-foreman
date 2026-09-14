import type { CapabilityCall } from "../lib/types";

export function CapabilityBoundary({ capabilities }: { capabilities: CapabilityCall[] }) {
  return (
    <section className="panel" aria-labelledby="capability-title">
      <div className="panel-heading"><div><p className="eyebrow">LEAST AUTHORITY</p><h2 id="capability-title">Capability boundary</h2></div><span className="boundary-lock" aria-hidden="true">⌁</span></div>
      <p className="panel-intro">Each specialist receives named capabilities with explicit effects and scope.</p>
      <div className="table-scroll"><table className="capability-table"><caption className="sr-only">Capability calls made during this run</caption><thead><tr><th scope="col">Agent</th><th scope="col">Capability</th><th scope="col">Effect</th><th scope="col">Status</th></tr></thead><tbody>
        {capabilities.map((call) => <tr key={call.id}><td>{call.agent}</td><td><code>{call.capability}</code><small>{call.scope}</small></td><td><span className={`effect effect--${call.effect}`}>{call.effect}</span></td><td><span className={`status-text status-text--${call.status}`}>{call.status}</span></td></tr>)}
      </tbody></table></div>
      {capabilities.length === 0 && <p className="empty">No capability calls recorded.</p>}
    </section>
  );
}
