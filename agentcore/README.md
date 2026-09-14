# AgentCore Runtime deployment

This directory packages the real Foreman HTTP service for Amazon Bedrock
AgentCore Runtime. No deployment is claimed merely because these files exist.

## Prerequisites

- AWS account and credentials with AgentCore and Bedrock access
- AgentCore CLI 0.29.0 (`npm install -g @aws/agentcore@0.29.0`)
- Docker or another OCI builder
- Node.js 22+
- access to the selected Bedrock model

`agentcore/agentcore.json` is the checked-in source of truth for a private,
IAM-authorized HTTP runtime. It gives Foreman only Bedrock model invocation
permissions. The multi-stage ARM64/AMD64 image downloads the matching pinned
Kujo 1.4.0 release and verifies its published SHA-256 before use.

Validate the configuration locally:

```bash
npm run install:all
npm run agentcore:validate
```

With current AWS credentials, run `agentcore deploy --dry-run`, review the CDK
diff, and then run `agentcore deploy`. On first use, the CLI records the account
and region in `agentcore/aws-targets.json`; commit that non-secret target file.
The runtime listens on port `8080` and writes only to its ephemeral `/tmp`
workspace.
The service contract is:

- `GET /ping` — health/readiness
- `POST /invocations` — AgentCore invocation entry point
- `POST /api/runs` — start a Foreman run
- `GET /api/runs/:id/events` — live server-sent events

The built-in golden invocation (`{"demo":true}`) creates an ephemeral Git
repository inside the runtime. General repository intake must mount or clone the
target into an isolated Workcell. Do not grant production deployment credentials.

## Verification

After deployment, invoke `/ping`, submit `{"demo":true}` to `/invocations`,
resolve its human decision through the local operator/API path, and verify every
evidence digest. Record the runtime ARN and smoke-test timestamp only after those
checks pass.
