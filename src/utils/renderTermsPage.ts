import { getBaseStyles, getLogo } from "./designSystem";

export function renderTermsPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Terms of Service - Wascer GTM MCP</title>
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
      <h1>Terms of Service</h1>

      <h2>Acceptance</h2>
      <p>By using the Wascer GTM MCP Server, you agree to these terms and to the <a href="/privacy" style="color: var(--blue);">Privacy Policy</a>.</p>

      <h2>Permitted use</h2>
      <p>This service is intended for managing Google Tag Manager accounts via the MCP protocol. You agree to:</p>
      <ul>
        <li>Use the service in compliance with Google Tag Manager's Terms of Service</li>
        <li>Not use the service for illegal or unauthorized purposes</li>
        <li>Be responsible for all operations performed with your credentials</li>
      </ul>

      <h2>Credentials</h2>
      <p>You are responsible for the security of your Google credentials and Service Accounts. Wascer is not liable for unauthorized access resulting from compromised credentials.</p>

      <h2>Availability</h2>
      <p>The service is provided "as is" without guarantees of uninterrupted availability. We reserve the right to modify or discontinue the service at any time.</p>

      <h2>Limitation of liability</h2>
      <p>Wascer is not liable for direct or indirect damages resulting from the use of the service, including unintended changes to GTM containers.</p>

      <a href="/" class="back">&larr; Back</a>
    </div>
  </div>
</body>
</html>`;
}
