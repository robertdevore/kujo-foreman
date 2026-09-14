# AgentCore Runtime deployment

This directory packages the real Foreman HTTP service for Amazon Bedrock
AgentCore Runtime. No deployment is claimed merely because these files exist.

## Prerequisites

- AWS account and credentials with AgentCore and Bedrock access
- Docker or another OCI builder
- Node.js 22+
- access to the selected Bedrock model

Set `FOREMAN_MODE=bedrock` and `FOREMAN_BEDROCK_MODEL` for the deployed runtime. Build
and push the image through the current AgentCore CLI or AWS console workflow,
then configure the container port as `8080`. The multi-stage image downloads
the pinned Kujo 1.4.0 release and verifies its published SHA-256 before use.
The service contract is:

- `GET /ping` — health/readiness
- `POST /invocations` — AgentCore invocation entry point
- `POST /api/runs` — start a Foreman run
- `GET /api/runs/:id/events` — live server-sent events

The runtime must mount or clone the target repository into an isolated Workcell.
Do not grant the container production deployment credentials. For a public demo,
put repository intake behind an allowlist and use an ephemeral filesystem.

## Verification

After deployment, invoke `/ping`, start the golden run, resolve its human
decision, download the evidence manifest, and verify every digest. Record the
runtime ARN and smoke-test timestamp in the submission only after those checks
pass.
