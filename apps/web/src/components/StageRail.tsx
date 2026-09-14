import { stageOrder, type Stage } from "../lib/types";

const marks: Record<Stage["status"], string> = { pending: "○", active: "◉", passed: "✓", warning: "!", failed: "×" };

export function StageRail({ stages }: { stages: Stage[] }) {
  const ordered = stageOrder.map((id) => stages.find((stage) => stage.id === id)).filter(Boolean) as Stage[];
  return (
    <nav className="stage-rail" aria-label="Release assessment stages">
      <ol>
        {ordered.map((stage, index) => (
          <li key={stage.id} className={`stage stage--${stage.status}`} aria-current={stage.status === "active" ? "step" : undefined}>
            <span className="stage-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="stage-mark" aria-hidden="true">{marks[stage.status]}</span>
            <span><b>{stage.label}</b><small>{stage.detail ?? stage.status}</small></span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
