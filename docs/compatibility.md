# Compatibility and verification

This release packages the existing remote MCP server; it does not embed or fork
its implementation. No service deployment or production data mutation is needed.

## Auth and package boundaries

| Client | Package/config | Key resolution |
| --- | --- | --- |
| Codex | `.agents/plugins/marketplace.json` → `plugins/tastefulkit` | `bearer_token_env_var` |
| Claude Code | `.claude-plugin/marketplace.json` → `integrations/claude/tastefulkit` | `${TASTEFULKIT_API_KEY}` in bundled HTTP headers |
| Cursor native plugin | `.cursor-plugin/marketplace.json` → `integrations/cursor/tastefulkit` | Declared private plugin variable |
| Cursor project install | `.cursor/mcp.json` + `.cursor/skills/tastefulkit` | `${env:TASTEFULKIT_API_KEY}` |
| OpenClaw | `integrations/openclaw/tastefulkit` portable Agent Plugins bundle | `${TASTEFULKIT_API_KEY}`, explicit Streamable HTTP |
| OpenCode | `opencode.json` + `.opencode/skills/tastefulkit` | `{env:TASTEFULKIT_API_KEY}`, OAuth disabled |
| VS Code/Copilot | Example `.vscode/mcp.json`; install skill separately | Password-masked input |

The canonical skill is copied at release time into independent plugin roots.
Copies are intentional: symlinks and paths escaping the plugin can fail when
clients archive, cache or install a subdirectory. CI rejects copy drift.

## Verification scope

- Live hosted MCP: authenticated initialization, expected five tools, read-only
  annotations, and successful calls to every tool; no profile/key data logged.
- Offline package validation and seven installer regression tests.
- Codex official plugin-creator validator and skill validator.
- Codex CLI 0.159.0: local marketplace registration and discovery of
  `tastefulkit@tastefulkit` 0.1.0. No model session or desktop UI exercised.
- Claude Code 2.1.285: native plugin and marketplace validators passed.
- OpenClaw 2026.9.6: its actual bundle MCP parser recognized TastefulKit as a
  supported HTTP server with zero diagnostics. No active-gateway installation.
- OpenCode 1.18.33: isolated project install, native skill discovery, and
  authenticated `mcp list` reported TastefulKit connected.
- Cursor and VS Code: config/packaging checked against current official docs;
  desktop end-to-end sessions not available in this environment.

Desktop UI sessions, all client versions, managed enterprise policies, and public
marketplace acceptance are not established by schema or protocol checks.
An install is not a promise of marketplace approval. Claude web/Cowork and ChatGPT
connector auth can differ from coding clients; API-key-only MCP does not imply
OAuth support. Public-directory registration and approval remain separate work.

## Release acceptance checklist

1. Run offline validation, installer tests and canonical skill synchronization.
2. Run vendor parser checks available in the test environment.
3. Run `scripts/smoke_mcp.py` with a privately configured key.
4. On a supported client, load the skill, discover all five tools and ask for a
   reference search; verify screenshot viewing with that client's image tooling.
5. Record exactly which versions and surfaces were exercised. Never label an
   untested desktop UI or approved marketplace listing as verified.
