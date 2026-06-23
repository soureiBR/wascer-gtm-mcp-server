import { getBaseStyles, getLogo } from "./designSystem";

export function renderMainPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wascer GTM MCP Server</title>
  ${getBaseStyles()}
  <style>
    .hero { text-align: center; padding: 80px 0 40px; }
    .hero-logo { margin: 0 auto 32px; width: 180px; }
    .hero h1 { font-size: 1.875rem; font-weight: 700; letter-spacing: -0.02em; color: var(--gray-800); margin: 0 0 12px; }
    .hero p { font-size: 0.9375rem; color: var(--gray-500); line-height: 1.55; max-width: 480px; margin: 0 auto; }
    .card { background: #fff; border: 1px solid var(--gray-200); border-radius: 16px; padding: 32px; margin: 0 auto 24px; max-width: 520px; box-shadow: 0 4px 8px -1px hsl(0 0% 0% / 0.05); }
    .card h2 { font-size: 1.125rem; font-weight: 600; color: var(--gray-800); margin: 0 0 16px; }
    .endpoint { background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 8px; padding: 12px 16px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.8125rem; color: var(--blue); word-break: break-all; }
    .tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
    .tool-badge { background: var(--blue-soft); color: var(--blue); font-size: 0.75rem; font-weight: 600; padding: 6px 12px; border-radius: 9999px; text-align: center; }
    .footer { text-align: center; padding: 24px 0; border-top: 1px solid var(--gray-200); margin-top: 40px; }
    .footer a { color: var(--blue); text-decoration: none; font-size: 0.8125rem; font-weight: 500; }
    .footer a:hover { text-decoration: underline; }
    .footer span { color: var(--gray-400); margin: 0 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="hero-logo">${getLogo()}</div>
      <h1>GTM MCP Server</h1>
      <p>Manage Google Tag Manager with AI assistants. Connect your MCP client and start creating containers, tags, triggers and variables using natural language.</p>
    </div>

    <div class="card">
      <h2>MCP Endpoint</h2>
      <div class="endpoint">/mcp</div>
    </div>

    <div class="card">
      <h2>Available Tools</h2>
      <div class="tools-grid">
        <div class="tool-badge">gtm_account</div>
        <div class="tool-badge">gtm_container</div>
        <div class="tool-badge">gtm_workspace</div>
        <div class="tool-badge">gtm_tag</div>
        <div class="tool-badge">gtm_trigger</div>
        <div class="tool-badge">gtm_variable</div>
        <div class="tool-badge">gtm_version</div>
        <div class="tool-badge">gtm_client</div>
        <div class="tool-badge">gtm_built_in_variable</div>
        <div class="tool-badge">gtm_setup</div>
      </div>
    </div>

    <div class="footer">
      <a href="/privacy">Privacy Policy</a>
      <span>|</span>
      <a href="/terms">Terms of Service</a>
    </div>
  </div>
</body>
</html>`;
}
