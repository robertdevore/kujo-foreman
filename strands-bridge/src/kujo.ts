import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";

export interface ProcessResult<T = unknown> { argv: string[]; exitCode: number; stdout: string; stderr: string; value: T }

export class KujoProcessError extends Error {
  constructor(message: string, readonly result: Omit<ProcessResult, "value">) { super(message); }
}

export async function resolveKujoBin(baseDirectory = process.cwd()): Promise<string> {
  const configured = process.env.KUJO_BIN;
  if (configured) return path.isAbsolute(configured) ? configured : path.resolve(baseDirectory, configured);
  return "kujo";
}

export function spawnArgv(executable: string, args: string[], options: { cwd: string; signal?: AbortSignal; timeoutMs?: number }): Promise<Omit<ProcessResult, "value">> {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { cwd: options.cwd, shell: false, stdio: ["ignore", "pipe", "pipe"], signal: options.signal });
    let stdout = ""; let stderr = ""; let timedOut = false;
    child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8");
    child.stdout.on("data", (value: string) => { stdout += value; });
    child.stderr.on("data", (value: string) => { stderr += value; });
    const timer = setTimeout(() => { timedOut = true; child.kill("SIGTERM"); }, options.timeoutMs ?? 360_000);
    child.on("error", (error) => { clearTimeout(timer); reject(error); });
    child.on("close", (code) => { clearTimeout(timer); resolve({ argv: [executable, ...args], exitCode: code ?? (timedOut ? 124 : 1), stdout, stderr }); });
  });
}

export class KujoCli {
  constructor(readonly root: string, readonly executable: string) {}

  async command<T>(command: string, args: string[] = [], options: { signal?: AbortSignal; allowFailure?: boolean } = {}): Promise<ProcessResult<T>> {
    const argv = ["run", "main.kujo", "--", command, ...args];
    const result = await spawnArgv(this.executable, argv, { cwd: this.root, signal: options.signal });
    let value: T;
    try { value = JSON.parse(result.stdout.trim()) as T; }
    catch { throw new KujoProcessError(`Kujo ${command} returned malformed JSON`, result); }
    if (result.exitCode !== 0 && !options.allowFailure) throw new KujoProcessError(`Kujo ${command} failed with exit code ${result.exitCode}`, result);
    return { ...result, value };
  }

  async demo(target: string, signal?: AbortSignal): Promise<void> {
    const setup = path.join(this.root, "demo", "setup.kujo");
    await access(setup);
    const result = await spawnArgv(this.executable, ["run", "demo/setup.kujo", "--", "--target", target], { cwd: this.root, signal });
    if (result.exitCode !== 0) {
      const detail = (result.stderr.trim() || result.stdout.trim() || "no process output").slice(0, 2_000);
      throw new KujoProcessError(`Kujo demo setup failed: ${detail}`, result);
    }
  }
}
