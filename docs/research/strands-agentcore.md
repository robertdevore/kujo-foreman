# Strands Agents and AgentCore research

Reviewed September 13, 2026 from current official documentation.

## Strands choice

Foreman uses the TypeScript SDK because the product runtime is Kujo rather than
Python. TypeScript provides the native declarative `Graph`, parallel nodes,
AND-semantics fan-in, conditional and cyclic edges, shared invocation state,
sessions, lifecycle hooks, structured outputs, MCP clients, Bedrock models,
streaming, retries, and OpenTelemetry.

The Python SDK has a broader eval SDK and some extra MCP/steering features, but
adding a Python application layer would weaken Foreman's Kujo-native product
story. Kujo Eval supplies the deterministic outcome evaluation that matters to
the release gate.

Important sources:

- [Graph](https://strandsagents.com/docs/user-guide/concepts/multi-agent/graph/)
- [MCP tools](https://strandsagents.com/docs/user-guide/concepts/tools/mcp-tools/)
- [Sessions](https://strandsagents.com/docs/user-guide/concepts/agents/session-management/)
- [Hooks](https://strandsagents.com/docs/user-guide/concepts/agents/hooks/)
- [Structured output](https://strandsagents.com/docs/user-guide/concepts/agents/structured-output/)
- [Tracing](https://strandsagents.com/docs/user-guide/observability-evaluation/traces/)
- [Metrics](https://strandsagents.com/docs/user-guide/observability-evaluation/metrics/)
- [Retry strategies](https://strandsagents.com/docs/user-guide/concepts/agents/retry-strategies/)

## AgentCore choice

The official deployment path targets AgentCore Runtime first. Runtime is a
framework- and model-agnostic serverless host with versioned endpoints and
session reuse. AgentCore Observability can collect traces, latency, token use,
and errors in CloudWatch.

AgentCore Gateway and AgentCore Policy are not on the critical path. Kujo
Ability already supplies the portable capability identity/effect contract, and
adding a second policy plane before its ownership boundary is proven would
make the trust story less clear.

Important sources:

- [AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html)
- [Runtime CLI deployment](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-cli.html)
- [Observability](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-get-started.html)
- [Policy concepts](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy-core-concepts.html)
- [Service limits](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/bedrock-agentcore-limits.html)

The current npm-distributed AgentCore CLI 0.29.0 configuration, CDK application,
least-privilege Bedrock policy, and multi-architecture container are checked in.
The configured local AWS credentials were rejected by STS during the final
deployment attempt, so no deployed resource is claimed.
