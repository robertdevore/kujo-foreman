import { chmod, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { KujoCli, resolveKujoBin } from "./kujo.js";

describe("Kujo process boundary", () => {
  it("passes hostile-looking values as literal argv without shell interpolation", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "foreman-argv-")); const capture = path.join(root, "argv.json"); const executable = path.join(root, "fake-kujo");
    await writeFile(executable, `#!/usr/bin/env node\nrequire('node:fs').writeFileSync(${JSON.stringify(capture)}, JSON.stringify(process.argv.slice(2))); process.stdout.write(JSON.stringify({ok:true}));\n`); await chmod(executable, 0o700);
    const hostile = "repo; touch /tmp/never-run"; await new KujoCli(root, executable).command("doctor", ["--repo", hostile]);
    expect(JSON.parse(await readFile(capture, "utf8"))).toEqual(["run", "main.kujo", "--", "doctor", "--repo", hostile]);
  });

  it("resolves a configured relative runtime before verification changes cwd", async () => {
    vi.stubEnv("KUJO_BIN", "../kujo/target/debug/kujo");
    expect(await resolveKujoBin("/workspace/foreman")).toBe("/workspace/kujo/target/debug/kujo");
    vi.unstubAllEnvs();
  });
});
