export function renderMainPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wascer GTM MCP Server</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 60px auto; padding: 0 20px; color: #333; }
    h1 { color: #1a1a1a; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>Wascer GTM MCP Server</h1>
  <p>This is a Model Context Protocol (MCP) server for Google Tag Manager, powered by Wascer.</p>
  <p>Connect your MCP client to <code>/mcp</code> to get started.</p>
  <p><a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a></p>
</body>
</html>`;
}
