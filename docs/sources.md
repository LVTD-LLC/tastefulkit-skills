# Platform references

Checked 2026-09-29. Client packaging and authentication differ; do not copy one
client's environment interpolation into another's configuration.

- [OpenAI plugin overview](https://learn.chatgpt.com/docs/plugins?surface=app)
- [OpenAI packaging and repository marketplaces](https://developers.openai.com/plugins/build/plugins)
- [Claude plugin manifests](https://code.claude.com/docs/en/plugins-reference)
- [Claude marketplace](https://claude.com/marketplace/plugins)
- [OpenClaw plugins](https://docs.openclaw.ai/tools/plugin)
- [OpenClaw compatible bundles and transport mapping](https://docs.openclaw.ai/plugins/bundles)
- [Agent Plugins MCP schema](https://agent-plugins.org/schemas/1.0.0/mcp.schema.json)
- [OpenCode plugins](https://opencode.ai/docs/plugins/)
- [OpenCode native skills](https://opencode.ai/docs/skills/)
- [OpenCode MCP configuration](https://opencode.ai/docs/mcp-servers/)
- [Cursor plugin manifests and publication](https://cursor.com/docs/reference/plugins)
- [Cursor MCP interpolation](https://cursor.com/docs/mcp)
- [VS Code MCP configuration](https://code.visualstudio.com/docs/agent-customization/mcp-servers)
- [TastefulKit MCP guide](https://tastefulkit.com/docs/api-reference/mcp/)

Separate package roots intentionally prevent client-specific marker precedence
from changing the auth/transport configuration. No runtime hooks, telemetry,
background services, auto-install dependencies, or automatic account writes.
