export function renderPrivacyPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Privacy Policy - Wascer GTM MCP Server</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 60px auto; padding: 0 20px; color: #333; }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p>This MCP server processes your Google account information (name and email) solely for authentication purposes.</p>
  <p>Google Tag Manager operations are performed using a platform service account. Your Google credentials are not stored.</p>
  <p><a href="/">Back to home</a></p>
</body>
</html>`;
}
