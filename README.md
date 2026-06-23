# Wascer GTM MCP Server

MCP server that allows AI assistants (Claude, Cursor, etc.) to manage Google Tag Manager using natural language.

## How to connect

### Claude Desktop

Settings → Developer → Edit Config:

```json
{
  "mcpServers": {
    "wascer-gtm": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://gtm-mcp.wascer.com/mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add wascer-gtm -- npx mcp-remote https://gtm-mcp.wascer.com/mcp
```

### Cursor / VS Code

Add to your MCP settings:

```json
{
  "mcpServers": {
    "wascer-gtm": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://gtm-mcp.wascer.com/mcp"]
    }
  }
}
```

When connecting, the browser opens for Google login. After authenticating, the tools become available.

## What you can do

Using natural language, you can ask the AI to:

- List GTM accounts and containers
- Create web and server-side containers
- Create and edit tags, triggers and variables
- Enable built-in variables (Page URL, Event, Click ID, etc.)
- Create server-side clients (GA4 client, etc.)
- Create and publish versions

### Usage example

```
In my GTM account, create a web container called "my-site" with:
- GA4 ID variable with value G-XXXXXXXX
- All Pages trigger
- GA4 Configuration tag pointing to the server
- Publish it
```

The AI executes all operations automatically via the Google Tag Manager API.

## Available tools

| Tool | Operations | Description |
|------|-----------|-------------|
| `gtm_account` | get, list, update | Manage GTM accounts |
| `gtm_container` | create, get, list, update, remove, snippet | Manage containers (web & server) |
| `gtm_workspace` | create, get, list, update, remove, createVersion, getStatus, sync | Manage workspaces and create versions |
| `gtm_tag` | create, get, list, update, remove, revert | Manage tags |
| `gtm_trigger` | create, get, list, update, remove, revert | Manage triggers |
| `gtm_variable` | create, get, list, update, remove, revert | Manage variables |
| `gtm_version` | get, live, publish, remove, setLatest, undelete, update | Manage and publish versions |
| `gtm_built_in_variable` | create, list, remove, revert | Enable/disable built-in variables |
| `gtm_client` | create, get, list, update, remove, revert | Manage server-side clients |
| `gtm_setup` | configure | Configure Service Account (optional, via prompt) |

## Authentication

### Google OAuth (default)

When connecting, you log in with your Google account. The MCP accesses GTM accounts that your account has permission on. No additional configuration needed.

### Service Account (optional)

For platform-level access (e.g. managing client accounts), add the Service Account JSON as a header in your MCP configuration. This is the **recommended and most secure** method — the SA never appears in chat or gets sent to the LLM.

#### Claude Desktop / Cursor / VS Code

```json
{
  "mcpServers": {
    "wascer-gtm": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://gtm-mcp.wascer.com/mcp",
        "--header",
        "X-GTM-Service-Account: ${GTM_SERVICE_ACCOUNT_JSON}"
      ],
      "env": {
        "GTM_SERVICE_ACCOUNT_JSON": "ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIs..."
      }
    }
  }
}
```

#### Claude Code

```bash
# 1. Encode your Service Account JSON file to base64
export GTM_SA=$(base64 -w 0 /path/to/service-account.json)

# 2. Add the MCP server with the SA as an environment variable
claude mcp add wascer-gtm \
  -e GTM_SERVICE_ACCOUNT_JSON="$GTM_SA" \
  -- npx mcp-remote https://gtm-mcp.wascer.com/mcp \
  --header "X-GTM-Service-Account: \${GTM_SERVICE_ACCOUNT_JSON}"
```

#### How it works

1. The `env` field sets the SA JSON as a local environment variable
2. `mcp-remote` reads `${GTM_SERVICE_ACCOUNT_JSON}` and injects it into the HTTP header
3. The server reads the header and configures the SA for the session
4. The SA **never appears in chat** and is **never sent to the LLM**
5. All GTM operations use the Service Account instead of your Google OAuth token

#### How to get a Service Account JSON

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → IAM & Admin → Service Accounts
2. Create a Service Account (or use an existing one)
3. Create a JSON key and download it
4. Base64 encode the JSON: `base64 -w 0 service-account.json`
5. Use the base64 string in the `GTM_SERVICE_ACCOUNT_JSON` env var
6. In Google Tag Manager, add the SA email as an admin on the accounts you want to manage

## Troubleshooting

**Reset authentication**

```bash
rm -rf ~/.mcp-auth
```

Restart your MCP client to re-login.

**"Access blocked" on Google login**

Make sure your Google account has access to Tag Manager and the OAuth app has GTM scopes enabled.

**Tools not showing up**

Use a short server name (e.g. `wascer-gtm`). Some clients have a 60-character limit for name + tool.

## License

Apache-2.0
