import express, { type NextFunction, type Request, type Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ForemanService } from "./service.js";
import { RunStore } from "./store.js";
import type { ForemanEvent, StartRunRequest } from "./contracts.js";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const defaultProjectRoot = path.resolve(moduleDir, "../..");
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
const asyncRoute = (handler: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => { void handler(req, res, next).catch(next); };

export function createApp(options: { projectRoot?: string; stateRoot?: string; mode?: "bedrock" | "offline" } = {}) {
  const projectRoot = options.projectRoot ?? defaultProjectRoot;
  const stateRoot = options.stateRoot ?? path.join(projectRoot, ".foreman");
  const mode = options.mode ?? (process.env.FOREMAN_MODE === "offline" ? "offline" : "bedrock");
  const store = new RunStore(stateRoot); const service = new ForemanService(projectRoot, store, mode); const app = express();
  app.disable("x-powered-by"); app.use(express.json({ limit: "32kb" }));
  app.use((_req, res, next) => { res.setHeader("Access-Control-Allow-Origin", process.env.FOREMAN_WEB_ORIGIN ?? "*"); res.setHeader("Access-Control-Allow-Headers", "Content-Type, Last-Event-ID"); res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); next(); });
  app.options("/{*path}", (_req, res) => res.sendStatus(204));
  app.get("/healthz", (_req, res) => res.json({ ok: true, orchestration: "strands-graph", domainRuntime: "kujo", mode }));
  app.get("/ping", (_req, res) => res.json({ status: "Healthy" }));
  app.post("/invocations", asyncRoute(async (req, res) => {
    const sessionId = req.header("x-amzn-bedrock-agentcore-runtime-session-id");
    const run = await service.create(req.body as StartRunRequest);
    if (sessionId) res.setHeader("x-amzn-bedrock-agentcore-runtime-session-id", sessionId);
    res.status(200).json({ runId: run.id, status: run.status, sessionId: sessionId ?? null, run });
  }));
  app.post("/api/runs", asyncRoute(async (req, res) => { const run = await service.create(req.body as StartRunRequest); res.status(202).json(run); }));
  app.get("/api/runs/:id", asyncRoute(async (req, res) => res.json(await store.load(String(req.params.id)))));
  app.post("/api/runs/:id/stop", asyncRoute(async (req, res) => res.json(await service.stop(String(req.params.id)))));
  app.post("/api/runs/:id/decisions/:decisionId", asyncRoute(async (req, res) => res.json(await service.decide(String(req.params.id), String(req.params.decisionId), String(req.body?.optionId ?? "")))));
  app.get("/api/runs/:id/evidence/:evidenceId", asyncRoute(async (req, res) => { const artifact = await service.evidence(String(req.params.id), String(req.params.evidenceId)); res.type(artifact.contentType).send(artifact.bytes); }));
  app.get("/api/runs/:id/events", asyncRoute(async (req, res) => {
    const runId = String(req.params.id); await store.load(runId); const lastId = Number(req.header("last-event-id") ?? req.query.lastEventId ?? 0) || 0; let sent = lastId;
    const pending: ForemanEvent[] = []; let replaying = true;
    const send = (event: ForemanEvent) => { if (event.sequence <= sent) return; sent = event.sequence; res.write(`id: ${event.sequence}\nevent: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`); };
    const unsubscribe = store.subscribe(runId, (event) => { if (replaying) pending.push(event); else send(event); });
    const replay = await store.replay(runId, lastId);
    res.status(200).set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" }); res.flushHeaders();
    replay.forEach(send); replaying = false; pending.forEach(send); res.write(": connected\n\n");
    const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 15_000);
    req.on("close", () => { clearInterval(heartbeat); unsubscribe(); });
  }));
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => { const message = error instanceof Error ? error.message : "unexpected error"; const missing = (error as NodeJS.ErrnoException)?.code === "ENOENT" || message.includes("not found"); res.status(missing ? 404 : 400).json({ error: message }); });
  return { app, service, store };
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 8787); const { app } = createApp();
  app.listen(port, () => process.stdout.write(`Kujo Foreman bridge listening on http://127.0.0.1:${port}\n`));
}
