# TastefulKit skills + MCP

Give your coding agent real design references: find landing pages, isolated UI
components and UI libraries, inspect screenshots, read DESIGN.md, and adapt the
visual direction to your project.

**One skill, five read-only MCP tools, no local server.** All current TastefulKit
features are free. Create an account and personal API key in
[Account settings](https://tastefulkit.com/settings).

## Install

Clone once for the local install paths:

```sh
git clone https://github.com/LVTD-LLC/tastefulkit-skills.git
cd tastefulkit-skills
```

Configure `TASTEFULKIT_API_KEY` privately in the environment that launches your
client. Never paste it into chat, a command argument, or committed configuration.
For a temporary Bash session, this prompts without echoing or recording the key
in shell history:

```sh
read -r -s -p 'TastefulKit API key: ' TASTEFULKIT_API_KEY
export TASTEFULKIT_API_KEY
printf '\n'
```

GUI clients and remote gateways may not inherit your terminal environment; use
their private environment/secret settings and restart the relevant process.

### Claude Code

Inside Claude Code:

```text
/plugin marketplace add LVTD-LLC/tastefulkit-skills
/plugin install tastefulkit@tastefulkit
```

The package includes both the skill and HTTP MCP connection. Restart/start a new
session after setting the environment key. Use `/mcp` to check the connection,
then try `/tastefulkit:tastefulkit` or the prompts below.

This is a custom GitHub marketplace, **not an approved listing in Anthropic's
public marketplace**. Claude web/Desktop/Cowork connector availability and auth
flows differ from Claude Code: do not assume importing the skill alone connects
MCP. OAuth-only connector surfaces cannot use this API-key-only endpoint directly.

### OpenAI / Codex

```sh
codex plugin marketplace add LVTD-LLC/tastefulkit-skills
codex plugin add tastefulkit@tastefulkit
```

Alternatively, open the plugin browser, choose the **TastefulKit** source and
install **tastefulkit**. The repo catalog bundles the skill and MCP config; the Codex
connection reads `TASTEFULKIT_API_KEY` through `bearer_token_env_var`.

If your Codex version does not support plugins, copy
`plugins/tastefulkit/skills/tastefulkit` into `~/.agents/skills/tastefulkit`
(without replacing an existing skill), then merge
[examples/codex.toml](examples/codex.toml) into your private Codex `config.toml`.
Do not add a second MCP connection when the bundled one is already enabled.

**ChatGPT public directory is a separate release path.** This repository does not
claim a universal-directory listing or a registered ChatGPT connector. That path
requires provider registration/testing and an authentication flow accepted by the
specific surface; no fabricated app ID or OAuth configuration is included.

### Cursor

For immediate project-local use (Node.js 20+):

```sh
node scripts/install.mjs cursor /absolute/path/to/your-project
```

This installs `.cursor/skills/tastefulkit` and merges the hosted MCP entry into
`.cursor/mcp.json`. Launch Cursor with the environment key, then check TastefulKit
under MCP tools. Existing unrelated settings are preserved; conflicts and JSONC
files are not overwritten.

A native Cursor plugin is also included in `integrations/cursor/tastefulkit`, with
a repository catalog at `.cursor-plugin/marketplace.json`. On plugin-enabled
team/custom-marketplace surfaces, configure the declared `TASTEFULKIT_API_KEY`
variable privately. Official Cursor Marketplace publication requires their review;
this repository is not yet listed there.

### OpenClaw

From the cloned repository, with a current version supporting Agent Plugins
bundles and HTTP MCP:

```sh
openclaw plugins install ./integrations/openclaw/tastefulkit
openclaw plugins inspect tastefulkit
```

The installer may ask you to confirm the local source. Review the package first;
for a noninteractive install, `--force` acknowledges that local-source prompt
(it can also overwrite an existing plugin, so only use it intentionally).
Provide `TASTEFULKIT_API_KEY` to the **gateway/agent runtime**, not just the install
shell. Start a new agent turn and confirm the five tools are available.

This separate portable bundle pins Streamable HTTP explicitly and avoids
cross-client manifest precedence. OpenClaw 2026.9.6 is the validation target.
Older builds may load skills but not HTTP MCP; upgrade or configure a supported
MCP bridge separately. Installation/inspection alone is not proof that a running
gateway has connected or exposed tools; agent/profile policies can restrict them.

### OpenCode

```sh
node scripts/install.mjs opencode /absolute/path/to/your-project
```

This installs `.opencode/skills/tastefulkit` and merges an MCP entry into
`opencode.json`, using OpenCode's `{env:TASTEFULKIT_API_KEY}` syntax and disabling
OAuth auto-discovery. Run `opencode mcp list` in that project after setting the key.
If you use `opencode.jsonc`, merge [the example](examples/opencode.json) manually;
the installer refuses to shadow or rewrite JSONC.

OpenCode's JavaScript plugins are lifecycle extensions. This integration uses its
native **skills + MCP** features instead of adding an unnecessary runtime plugin.

### Other agents

Copy the canonical `plugins/tastefulkit/skills/tastefulkit` directory to your
client's documented skill location and configure:

- Endpoint: `https://tastefulkit.com/mcp/` (keep the trailing slash).
- Transport: Streamable HTTP.
- Authentication: `Authorization: Bearer <your personal API key>` through private
  client configuration, never a URL parameter.

[VS Code/Copilot example](examples/vscode-mcp.json) uses a masked input rather than
a literal secret. Merge it into `.vscode/mcp.json`, and install the skill in the
client's supported skills directory. Generic skill installers can discover the
skill in this repo, but **installing only a SKILL.md does not configure MCP**.

## Try it

> Use TastefulKit to find three warm, minimal landing-page references for this app.
> Inspect their screenshots and DESIGN.md, then adapt the strongest direction.

> Find a hero and call-to-action from the same source site and apply their visual
> principles to our homepage, preserving our copy and branding.

> Find UI libraries that fit this project's stack. Compare the returned metadata
> and verify upstream licenses before proposing a dependency.

## Bundled tools

| Tool | Purpose |
| --- | --- |
| `list_designs` | Browse published, ready references; kind/tag/industry/site filters, 24 per page. |
| `search_designs` | Search with the same filters; semantic matching with text fallback. |
| `get_design` | Metadata, available DESIGN.md, source link and signed image URLs. |
| `get_design_filters` | Discover current kinds, tags and industries. |
| `get_user_info` | Verify the connected account when needed. |

No voting, personalization, uploads or submission tools are exposed. All tools
are read-only. Screenshot URLs expire after 15 minutes; fetch a design again for
fresh URLs. A reference is not source code or permission to reuse original assets.

## Verify / troubleshoot

```sh
node --test scripts/install.test.mjs
python3 scripts/validate.py
# Optional read-only live check; uses your environment key, prints no profile data:
uv run --with 'mcp>=1.26,<2' python scripts/smoke_mcp.py
```

- **401:** key missing, invalid, rotated, or account disabled; configure it privately.
- **Tools missing:** install/enable MCP as well as the skill, restart the client,
  and check client policies. Do not replace the URL with an OAuth endpoint.
- **Images expired:** call `get_design` again.
- **Missing guide:** `design_markdown: null` means unavailable, not paid access.
- **Existing config conflict:** merge the example manually; do not discard your config.

See [compatibility and verification](docs/compatibility.md) for tested boundaries,
[source references](docs/sources.md) for vendor docs, and [CHANGELOG](CHANGELOG.md).

## Maintainers

Edit the canonical skill under `plugins/tastefulkit/skills/`, then run
`node scripts/sync.mjs` to refresh packaged copies. `scripts/validate.py` catches
drift, unsafe paths, unexpected endpoints and missing configs. Keep secrets out
of fixtures and CI; CI never needs a TastefulKit key. Ship changes through PRs.
The server remains in the [TastefulKit app](https://github.com/LVTD-LLC/tastefulkit);
this repository ships connection configuration, not a second hosted server.

MIT applies to this integration's code and instructions, not third-party designs.
