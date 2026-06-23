# Wascer GTM MCP Server

MCP server that allows AI assistants (Claude, Cursor, etc.) to manage Google Tag Manager using natural language.

## How to connect

### With Service Account (recommended)

#### Claude Desktop

Settings → Developer → Edit Config:

```json
{
  "mcpServers": {
    "wascer-gtm": {
      "command": "bash",
      "args": [
        "-c",
        "npx -y mcp-remote https://gtm-mcp.wascer.com/mcp --header \"X-GTM-Service-Account: $(base64 -w 0 $GTM_SERVICE_ACCOUNT_FILE)\""
      ],
      "env": {
        "GTM_SERVICE_ACCOUNT_FILE": "/path/to/service-account.json"
      }
    }
  }
}
```

#### Cursor

Settings → MCP → Add Server:

```json
{
  "mcpServers": {
    "wascer-gtm": {
      "command": "bash",
      "args": [
        "-c",
        "npx -y mcp-remote https://gtm-mcp.wascer.com/mcp --header \"X-GTM-Service-Account: $(base64 -w 0 $GTM_SERVICE_ACCOUNT_FILE)\""
      ],
      "env": {
        "GTM_SERVICE_ACCOUNT_FILE": "/path/to/service-account.json"
      }
    }
  }
}
```

#### VS Code

Add to `.vscode/mcp.json` or user settings:

```json
{
  "mcpServers": {
    "wascer-gtm": {
      "command": "bash",
      "args": [
        "-c",
        "npx -y mcp-remote https://gtm-mcp.wascer.com/mcp --header \"X-GTM-Service-Account: $(base64 -w 0 $GTM_SERVICE_ACCOUNT_FILE)\""
      ],
      "env": {
        "GTM_SERVICE_ACCOUNT_FILE": "/path/to/service-account.json"
      }
    }
  }
}
```

#### Claude Code

```bash
claude mcp add wascer-gtm \
  -e GTM_SERVICE_ACCOUNT_FILE="/path/to/service-account.json" \
  -- bash -c 'npx -y mcp-remote https://gtm-mcp.wascer.com/mcp --header "X-GTM-Service-Account: $(base64 -w 0 $GTM_SERVICE_ACCOUNT_FILE)"'
```

> Just replace `/path/to/service-account.json` with the actual path to your Service Account JSON file. The base64 encoding is handled automatically.

### Without Service Account

If you don't have a Service Account, the MCP will use your Google OAuth login instead. You'll have access to GTM accounts that your Google account has permission on.

#### Claude Desktop / Cursor / VS Code

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

#### Claude Code

```bash
claude mcp add wascer-gtm -- npx mcp-remote https://gtm-mcp.wascer.com/mcp
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

| Tool                    | Operations                                                        | Description                                     |
| ----------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `gtm_account`           | get, list, update                                                 | Manage GTM accounts                             |
| `gtm_container`         | create, get, list, update, remove, snippet                        | Manage containers (web & server)                |
| `gtm_workspace`         | create, get, list, update, remove, createVersion, getStatus, sync | Manage workspaces and create versions           |
| `gtm_tag`               | create, get, list, update, remove, revert                         | Manage tags                                     |
| `gtm_trigger`           | create, get, list, update, remove, revert                         | Manage triggers                                 |
| `gtm_variable`          | create, get, list, update, remove, revert                         | Manage variables                                |
| `gtm_version`           | get, live, publish, remove, setLatest, undelete, update           | Manage and publish versions                     |
| `gtm_built_in_variable` | create, list, remove, revert                                      | Enable/disable built-in variables               |
| `gtm_client`            | create, get, list, update, remove, revert                         | Manage server-side clients                      |

## Authentication

### Google OAuth (default)

When connecting, you log in with your Google account. The MCP accesses GTM accounts that your account has permission on. No additional configuration needed.

### Service Account (optional)

For platform-level access (e.g. managing client accounts), point to your Service Account JSON file in the MCP configuration (as shown in the connection examples above). The file is read locally, base64 encoded automatically, and sent via HTTP header — it **never appears in chat** and is **never sent to the LLM**.

#### How to get a Service Account JSON

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → IAM & Admin → Service Accounts
2. Create a Service Account (or use an existing one)
3. Create a JSON key and download it
4. Save the JSON file somewhere on your machine (e.g. `~/keys/service-account.json`)
5. Use the file path in the `GTM_SERVICE_ACCOUNT_FILE` env var in your MCP config
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
