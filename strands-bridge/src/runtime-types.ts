import type { ForemanRun, ForemanEventInput, StartRunRequest } from "./contracts.js";
import type { KujoCli } from "./kujo.js";

export interface DomainRun { [key: string]: unknown; run_id?: string; change_set?: Record<string, unknown>; specification?: Record<string, unknown>; verification_plan?: Array<Record<string, unknown>>; verification_results?: Array<Record<string, unknown>>; risk_findings?: Array<Record<string, unknown>>; repair_attempts?: Array<Record<string, unknown>>; human_decisions?: Array<Record<string, unknown>>; evidence?: Array<Record<string, unknown>>; release_decision?: Record<string, unknown> }
export interface RunContext {
  id: string; request: Required<Pick<StartRunRequest, "repository" | "ref" | "intent">> & Pick<StartRunRequest, "compareRef">; managedWorkspace: boolean;
  bridge: ForemanRun; domain: DomainRun; cli: KujoCli; workDir: string; abort: AbortController;
  repairIteration: number; repairEligible: boolean;
  emit(event: ForemanEventInput): Promise<void>;
  save(): Promise<void>;
}
