import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ForemanEvent, ForemanEventInput, ForemanRun } from "./contracts.js";

export class RunStore {
  private sequences = new Map<string, number>();
  private listeners = new Map<string, Set<(event: ForemanEvent) => void>>();
  private saveQueues = new Map<string, Promise<void>>();
  private publishQueues = new Map<string, Promise<ForemanEvent>>();
  constructor(readonly root: string) {}
  private dir(id: string) { return path.join(this.root, "runs", id); }
  private snapshot(id: string) { return path.join(this.dir(id), "snapshot.json"); }
  private events(id: string) { return path.join(this.dir(id), "events.jsonl"); }
  async init(id: string) { await mkdir(this.dir(id), { recursive: true, mode: 0o700 }); }
  workDir(id: string) { return path.join(this.dir(id), "work"); }
  async save(run: ForemanRun) {
    const prior = this.saveQueues.get(run.id) ?? Promise.resolve();
    const queued = prior.catch(() => undefined).then(async () => {
      run.updatedAt = new Date().toISOString(); await this.init(run.id);
      const target = this.snapshot(run.id); const temp = `${target}.${process.pid}.${Math.random().toString(16).slice(2)}.tmp`;
      await writeFile(temp, JSON.stringify(run, null, 2), { mode: 0o600 }); await rename(temp, target);
    });
    this.saveQueues.set(run.id, queued); await queued;
  }
  async load(id: string): Promise<ForemanRun> { return JSON.parse(await readFile(this.snapshot(id), "utf8")) as ForemanRun; }
  async publish(id: string, event: ForemanEventInput): Promise<ForemanEvent> {
    const prior = this.publishQueues.get(id) ?? Promise.resolve(undefined as never);
    const queued = prior.catch(() => undefined as never).then(async () => {
      let sequence = this.sequences.get(id);
      if (sequence === undefined) { const events = await this.replay(id, 0); sequence = events.at(-1)?.sequence ?? 0; }
      const complete = { ...event, sequence: sequence + 1 } as ForemanEvent; this.sequences.set(id, sequence + 1);
      await appendFile(this.events(id), `${JSON.stringify(complete)}\n`, { mode: 0o600 });
      for (const listener of this.listeners.get(id) ?? []) listener(complete); return complete;
    });
    this.publishQueues.set(id, queued); return queued;
  }
  async replay(id: string, after: number): Promise<ForemanEvent[]> {
    try { return (await readFile(this.events(id), "utf8")).split("\n").filter(Boolean).map((line) => JSON.parse(line) as ForemanEvent).filter((event) => event.sequence > after); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
  }
  subscribe(id: string, listener: (event: ForemanEvent) => void): () => void {
    const set = this.listeners.get(id) ?? new Set(); set.add(listener); this.listeners.set(id, set);
    return () => { set.delete(listener); if (!set.size) this.listeners.delete(id); };
  }
}
