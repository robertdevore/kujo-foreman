import { render, screen } from "@testing-library/react";
import { matchRoute } from "./App";
import { HumanDecisionPanel } from "./components/HumanDecisionPanel";
import { NewRun } from "./components/NewRun";
import { previewRun } from "./lib/preview-fixture";

describe("routing", () => {
  it("matches live evidence routes", () => {
    expect(matchRoute("/runs/run-42/evidence")).toEqual({ kind: "run", id: "run-42", evidence: true });
  });

  it("falls back to new run", () => {
    expect(matchRoute("/unknown")).toEqual({ kind: "new" });
  });
});

describe("human decision boundary", () => {
  it("shows why the agent stopped and disables mutations in preview", () => {
    render(<HumanDecisionPanel decision={previewRun.humanDecision!} disabled onResolve={async () => undefined} />);
    expect(screen.getByRole("heading", { name: /human decision required/i })).toBeInTheDocument();
    expect(screen.getByText(/externally observable financial behavior/i)).toBeInTheDocument();
    expect(screen.getByText(/disabled in preview fixture/i)).toBeInTheDocument();
    expect(screen.getAllByRole("radio")[0]).toBeDisabled();
  });
});

describe("golden path", () => {
  it("offers a real golden run separately from the static preview", () => {
    render(<NewRun />);
    expect(screen.getByRole("button", { name: /run golden demo/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inspect static preview/i })).toBeInTheDocument();
  });
});
