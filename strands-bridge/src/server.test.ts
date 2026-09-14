import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "./server.js";

const servers: Array<ReturnType<ReturnType<typeof createApp>["app"]["listen"]>> = [];
afterEach(() => { for (const server of servers.splice(0)) server.close(); });

describe("runtime transport", () => {
  it("exposes health contracts without starting a fake run", async () => {
    const stateRoot = await mkdtemp(path.join(os.tmpdir(), "foreman-http-")); const { app } = createApp({ stateRoot, mode: "offline" }); const server = app.listen(0); servers.push(server);
    await new Promise<void>((resolve) => server.once("listening", resolve)); const port = (server.address() as AddressInfo).port;
    expect(await (await fetch(`http://127.0.0.1:${port}/ping`)).json()).toEqual({ status: "Healthy" });
    expect(await (await fetch(`http://127.0.0.1:${port}/healthz`)).json()).toMatchObject({ ok: true, orchestration: "strands-graph", domainRuntime: "kujo", mode: "offline" });
  });

  it("honors the writable AgentCore state root", () => {
    const previous = process.env.FOREMAN_STATE_ROOT;
    process.env.FOREMAN_STATE_ROOT = "/tmp/foreman-agentcore-test";
    try {
      const { store } = createApp({ projectRoot: process.cwd(), mode: "offline" });
      expect(store.root).toBe("/tmp/foreman-agentcore-test");
    } finally {
      if (previous === undefined) delete process.env.FOREMAN_STATE_ROOT;
      else process.env.FOREMAN_STATE_ROOT = previous;
    }
  });
});
