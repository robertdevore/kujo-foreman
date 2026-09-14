import { useState, type FormEvent } from "react";
import type { HumanDecision } from "../lib/types";

interface Props {
  decision: HumanDecision;
  disabled?: boolean;
  onResolve: (optionId: string) => Promise<void>;
}

export function HumanDecisionPanel({ decision, disabled, onResolve }: Props) {
  const [selection, setSelection] = useState(decision.selectedOptionId ?? decision.recommendation ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selection || disabled) return;
    setPending(true);
    setError(undefined);
    try { await onResolve(selection); } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Decision could not be recorded.");
      setPending(false);
    }
  }

  return (
    <section className="decision-panel" aria-labelledby="human-decision-title">
      <div className="decision-stripe" aria-hidden="true" />
      <div className="decision-heading"><p className="eyebrow">ACCOUNTABLE BOUNDARY</p><h2 id="human-decision-title">Human decision required</h2><span className="confidence">{decision.confidence ?? "unknown"} confidence</span></div>
      <p className="decision-question">{decision.question}</p>
      <div className="decision-reason"><b>Why Foreman stopped</b><p>{decision.reason}</p></div>
      <form onSubmit={submit}>
        <fieldset disabled={disabled || pending || Boolean(decision.selectedOptionId)}>
          <legend>Choose an authorized direction</legend>
          {decision.options.map((option) => (
            <label className={`decision-option ${option.id === decision.recommendation ? "decision-option--recommended" : ""}`} key={option.id}>
              <input type="radio" name="human-decision" value={option.id} checked={selection === option.id} onChange={() => setSelection(option.id)} />
              <span><b>{option.label}</b>{option.description && <small>{option.description}</small>}</span>
              {option.id === decision.recommendation && <em>RECOMMENDED</em>}
            </label>
          ))}
        </fieldset>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="decision-actions">
          <span>Evidence: {decision.evidence.join(" · ")}</span>
          {disabled ? <span className="fixture-notice">Disabled in preview fixture</span> : decision.selectedOptionId ? <span>Decision recorded: {decision.selectedOptionId}</span> : <button className="sk-button" type="submit" disabled={!selection || pending}>{pending ? "Recording…" : "Record decision & continue →"}</button>}
        </div>
      </form>
    </section>
  );
}
