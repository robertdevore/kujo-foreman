# AgentCore Runtime deployment

This directory packages the real Foreman HTTP service for Amazon Bedrock
AgentCore Runtime. The private IAM-authorized runtime is deployed in `us-east-1`;
its versioned, smoke-tested metadata is recorded in
[`deployment.json`](deployment.json).

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
diff, and then run `agentcore deploy`. If AgentCore CLI 0.29.0 recursively stages
the CDK output inside the container build context, use the checked-in CDK app
with an output directory outside this repository:

```bash
cd agentcore/cdk
AWS_PROFILE=kujo-foreman npm run cdk -- deploy AgentCore-KujoForeman-default \
  --output /tmp/kujo-foreman-cdk.out --require-approval never
```

On first use, the CLI records the account and region in
`agentcore/aws-targets.json`; commit that non-secret target file. The runtime
listens on port `8080` and writes only to its ephemeral `/tmp` workspace.
The service contract is:

- `GET /ping` — health/readiness
- `POST /invocations` — AgentCore invocation entry point. Start with
  `{"demo":true}`, poll with `{"action":"get","runId":"..."}`, and resolve an
  escalation with `{"action":"decide","runId":"...","decisionId":"...","optionId":"accept-change"}`
- `POST /api/runs` — start a Foreman run
- `GET /api/runs/:id/events` — live server-sent events

The built-in golden invocation (`{"demo":true}`) creates an ephemeral Git
repository inside the runtime. General repository intake must mount or clone the
target into an isolated Workcell. Do not grant production deployment credentials.

## Verification

The reproducible cloud smoke starts the golden repository, polls the real
runtime, resolves the deliberate payment-risk escalation, and requires a final
checksummed `READY_TO_SHIP` decision:

```bash
AWS_PROFILE=kujo-foreman \
FOREMAN_AGENTCORE_RUNTIME_ARN="$(jq -r .runtimeArn agentcore/deployment.json)" \
npm run agentcore:cloud-smoke
```

Version 6 passed this end-to-end check on September 14, 2026 using Amazon Nova
Pro through Bedrock. The verified run executed Kujo checks, made one bounded
repair, stopped for one human decision, and completed with seven evidence
artifacts and zero blockers.
