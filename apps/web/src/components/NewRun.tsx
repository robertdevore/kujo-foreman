import { useState, type FormEvent } from "react";
import { foremanApi } from "../lib/api";

export function NewRun() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(undefined);
    try {
      const run = await foremanApi.startRun({
        repository: String(form.get("repository") ?? ""),
        ref: String(form.get("ref") ?? ""),
        compareRef: String(form.get("compareRef") ?? "") || undefined,
        intent: String(form.get("intent") ?? ""),
      });
      window.history.pushState({}, "", `/runs/${run.id}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The run could not be started.");
      setPending(false);
    }
  }

  return (
    <div className="page page--narrow">
      <section className="hero-block" aria-labelledby="new-run-title">
        <p className="eyebrow">RELEASE READINESS / NEW RUN</p>
        <h1 id="new-run-title">Put evidence between<br />code complete and ship.</h1>
        <p className="lede">Foreman reconstructs intent, verifies behavior in isolation, investigates risk, repairs bounded defects, and stops when judgment belongs to a human.</p>
      </section>

      <form className="run-form" onSubmit={submit}>
        <div className="form-heading">
          <span className="section-index">01</span>
          <div><h2>Change set</h2><p>Point Foreman at a local Git repository and the exact change to evaluate.</p></div>
        </div>
        <label className="field field--wide">
          <span>Repository path</span>
          <input name="repository" type="text" required placeholder="/workspace/payment-service" autoComplete="off" />
          <small>Local paths are evaluated directly. Remote adapters can resolve provider URLs.</small>
        </label>
        <div className="field-row">
          <label className="field"><span>Change ref</span><input name="ref" type="text" required placeholder="feature/bounded-retries" autoComplete="off" /></label>
          <label className="field"><span>Compare against</span><input name="compareRef" type="text" placeholder="main" autoComplete="off" /></label>
        </div>

        <div className="form-heading form-heading--second">
          <span className="section-index">02</span>
          <div><h2>Intent</h2><p>Give Foreman the requirement, issue, or acceptance intent—not instructions from repository content.</p></div>
        </div>
        <label className="field field--wide">
          <span>What should this change accomplish?</span>
          <textarea name="intent" required rows={5} placeholder="Add bounded retry support to failed payment captures without changing existing payment policy." />
        </label>

        {error && <div className="sk-alert" data-variant="danger" role="alert"><strong>Unable to start</strong><p>{error}</p></div>}
        <div className="form-actions">
          <p><b>Authority:</b> read repository, execute isolated checks, bounded repair branch. Never production.</p>
          <button className="sk-button" type="submit" disabled={pending}>{pending ? "Starting Foreman…" : "Start release assessment →"}</button>
        </div>
      </form>

      <aside className="preview-callout" aria-label="Product preview">
        <div><p className="eyebrow">NO BACKEND AVAILABLE?</p><h2>Walk through the decision surface.</h2><p>The product tour is a labeled static preview fixture. It does not claim to execute a release assessment.</p></div>
        <a className="sk-button sk-button--secondary" href="/preview">Open preview fixture</a>
      </aside>
    </div>
  );
}
