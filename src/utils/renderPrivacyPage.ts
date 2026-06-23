import { getBaseStyles, getLogo } from "./designSystem";

export function renderPrivacyPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Privacy Policy - Wascer GTM MCP</title>
  ${getBaseStyles()}
  <style>
    .header { padding: 32px 0; border-bottom: 1px solid var(--gray-200); margin-bottom: 32px; }
    .header a { text-decoration: none; }
    .content { max-width: 520px; margin: 0 auto; }
    .content h1 { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; color: var(--gray-800); margin: 0 0 24px; }
    .content h2 { font-size: 1.125rem; font-weight: 600; color: var(--gray-800); margin: 24px 0 12px; }
    .content p { font-size: 0.9375rem; color: var(--gray-600); line-height: 1.65; margin: 0 0 12px; }
    .content ul { padding-left: 20px; margin: 0 0 12px; }
    .content li { font-size: 0.9375rem; color: var(--gray-600); line-height: 1.65; margin-bottom: 6px; }
    .back { display: inline-flex; align-items: center; gap: 6px; color: var(--blue); font-size: 0.8125rem; font-weight: 500; text-decoration: none; margin-top: 32px; padding-bottom: 40px; }
    .back:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="/">${getLogo()}</a>
    </div>
    <div class="content">
      <h1>Privacy Policy</h1>

      <h2>Data collected</h2>
      <p>When connecting to the Wascer GTM MCP Server, we only collect the information required for authentication:</p>
      <ul>
        <li>Google account name and email (for identification)</li>
        <li>OAuth access token (to operate Google Tag Manager)</li>
      </ul>

      <h2>How we use your data</h2>
      <p>Your data is used exclusively to:</p>
      <ul>
        <li>Authenticate your session on the MCP server</li>
        <li>Execute operations on Google Tag Manager on your behalf</li>
      </ul>

      <h2>Storage</h2>
      <p>OAuth tokens are temporarily stored in the session (Durable Object) and discarded when the session expires. We do not store passwords or permanent credentials.</p>

      <h2>Service Account (optional)</h2>
      <p>If you choose to use a Service Account via <code>gtm_setup</code>, the JSON is stored only in memory during the active session. It is not persisted to any database.</p>

      <h2>Sharing</h2>
      <p>We do not share your data with third parties. The only external communications are with Google APIs (OAuth and Tag Manager).</p>

      <a href="/" class="back">&larr; Back</a>
    </div>
  </div>
</body>
</html>`;
}
