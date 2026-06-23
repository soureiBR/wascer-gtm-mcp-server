# Wascer GTM MCP Server

A remote MCP (Model Context Protocol) server for Google Tag Manager, powered by [Wascer](https://wascer.com). Enables AI assistants like Claude, Cursor, and others to manage GTM accounts, containers, tags, triggers, variables, and more.

## Features

- **Google OAuth authentication** with full GTM API scopes
- **Service Account support** (optional) via `gtm_setup` tool for platform-level access
- **11 tools** covering the complete GTM workflow: accounts, containers, workspaces, tags, triggers, variables, versions, built-in variables, clients, and more
- **Remote-first** architecture on Cloudflare Workers with Durable Objects

## Available Tools

| Tool | Operations | Description |
|------|-----------|-------------|
| `gtm_setup` | configure | Configure a Google Service Account for platform-level GTM access (optional) |
| `gtm_account` | get, list, update | Manage GTM accounts |
| `gtm_container` | create, get, list, update, remove, snippet | Manage containers (web & server) |
| `gtm_workspace` | create, get, list, update, remove, createVersion, getStatus, sync | Manage workspaces and create versions |
| `gtm_tag` | create, get, list, update, remove, revert | Manage tags |
| `gtm_trigger` | create, get, list, update, remove, revert | Manage triggers |
| `gtm_variable` | create, get, list, update, remove, revert | Manage variables |
| `gtm_version` | get, live, publish, remove, setLatest, undelete, update | Manage and publish container versions |
| `gtm_built_in_variable` | create, list, remove, revert | Enable/disable built-in variables |
| `gtm_client` | create, get, list, update, remove, revert | Manage server-side clients |
| `gtm_remove_session` | revoke | Clear session data and revoke access |

## Authentication Modes

### Mode 1: Google OAuth (default)

Users authenticate with their Google account. The MCP server requests GTM permissions during login. Users can access any GTM account their Google account has permissions on.

### Mode 2: Service Account (optional)

For platform-level access, users can call `gtm_setup` with a Google Service Account JSON. This overrides the OAuth token for the session and grants access to all GTM accounts the Service Account has been granted permissions on.

## Setup

### Claude Desktop

Open Settings -> Developer -> Edit Config and add:

```json
{
  "mcpServers": {
    "wascer-gtm": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-worker-url.com/mcp"
      ]
    }
  }
}
```

### Claude Code (CLI)

```bash
claude mcp add wascer-gtm -- npx mcp-remote https://your-worker-url.com/mcp
```

### Cursor / VS Code

Add to your MCP settings:

```json
{
  "mcpServers": {
    "wascer-gtm": {
      "command": "npx",
      "args": ["mcp-remote", "https://your-worker-url.com/mcp"]
    }
  }
}
```

After connecting, a browser window will open for Google OAuth. Complete the login to grant GTM access.

## Local Development

### Prerequisites

- Node.js 18+
- A Google Cloud OAuth app (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`)
- Add `http://localhost:3333/callback` as an authorized redirect URI in the Google Cloud Console

### Setup

```bash
git clone https://github.com/wascer/wascer-gtm-mcp-server.git
cd wascer-gtm-mcp-server
npm install
```

Create a `.dev.vars` file:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
COOKIE_ENCRYPTION_KEY=any-secret-string
WORKER_HOST=http://localhost:3333
```

### Run

```bash
npx wrangler dev
```

The server starts at `http://localhost:3333`.

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

Connect using STDIO transport with command `npx` and arguments `mcp-remote http://localhost:3333/mcp`.

### Run Tests

```bash
npm test
```

### Build

```bash
npm run build
```

## Deployment

### Cloudflare Workers

1. Create a KV namespace:
```bash
wrangler kv namespace create OAUTH_KV
```

2. Update `wrangler.jsonc` with the KV namespace ID

3. Set secrets:
```bash
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put COOKIE_ENCRYPTION_KEY
wrangler secret put WORKER_HOST
```

4. Deploy:
```bash
npm run deploy
```

## Troubleshooting

**MCP Server Name Length Limit**

Some MCP clients have a 60-character limit for the combined server name + tool name. Use a short server name like `wascer-gtm`.

**Clearing Auth Cache**

[mcp-remote](https://github.com/geelen/mcp-remote#readme) stores credentials in `~/.mcp-auth`. To reset:

```bash
rm -rf ~/.mcp-auth
```

Then restart your MCP client.

**Google OAuth Consent Screen**

If you see "Access blocked" during login, make sure your Google Cloud OAuth app has the GTM API scopes enabled and the app is configured for the correct user type (internal or external with test users).

## License

Apache-2.0
