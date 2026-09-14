import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RunStore } from "./store.js";

describe("event persistence", () => {
  it("replays strictly after Last-Event-ID", async () => {
    const store = new RunStore(await mkdtemp(path.join(os.tmpdir(), "foreman-store-"))); await store.init("run-1");
    await store.publish("run-1", { type: "run.status", status: "running", timestamp: "2026-09-13T00:00:00Z" });
    await store.publish("run-1", { type: "run.status", status: "completed", timestamp: "2026-09-13T00:00:01Z" });
    expect((await store.replay("run-1", 1)).map((event) => event.sequence)).toEqual([2]);
  });
});

