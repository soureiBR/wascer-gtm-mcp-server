import type {
  ClientInfo,
  AuthRequest,
} from "@cloudflare/workers-oauth-provider";

const COOKIE_NAME = "mcp-approved-clients";
const ONE_YEAR_IN_SECONDS = 31536000;

function decodeState<T = any>(encoded: string): T {
  try {
    const jsonString = atob(encoded);
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Error decoding state:", e);
    throw new Error("Could not decode state");
  }
}

async function importKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signData(data: string, secret: string): Promise<string> {
  const key = await importKey(secret);
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data),
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function verifySignature(
  data: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const key = await importKey(secret);
  const encoder = new TextEncoder();
  const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(data));
}

function getCookieValue(
  request: Request,
  cookieName: string,
): string | undefined {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${cookieName}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : undefined;
}

export async function clientIdAlreadyApproved(
  request: Request,
  clientId: string,
  encryptionKey: string,
): Promise<boolean> {
  const cookieValue = getCookieValue(request, COOKIE_NAME);
  if (!cookieValue) return false;

  try {
    const [data, sig] = cookieValue.split(".");
    if (!data || !sig) return false;
    const valid = await verifySignature(data, sig, encryptionKey);
    if (!valid) return false;
    const approvedClients: string[] = JSON.parse(atob(data));
    return approvedClients.includes(clientId);
  } catch {
    return false;
  }
}

export async function renderApprovalDialog(
  request: Request,
  options: {
    client: ClientInfo | null;
    server: { name: string; description: string };
    state: { oauthReqInfo: AuthRequest };
  },
): Promise<Response> {
  const { client, server, state } = options;
  const stateEncoded = btoa(JSON.stringify(state));

  const html = `<!DOCTYPE html>
<html>
<head><title>Authorize ${server.name}</title></head>
<body>
  <h1>Authorize ${server.name}</h1>
  <p>${client?.clientName || "An application"} wants to access your account.</p>
  <form method="POST">
    <input type="hidden" name="state" value="${stateEncoded}" />
    <button type="submit" name="action" value="approve">Approve</button>
  </form>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

export async function parseRedirectApproval(
  request: Request,
  encryptionKey: string,
): Promise<{
  state: { oauthReqInfo: AuthRequest };
  headers: Record<string, string>;
}> {
  const formData = await request.formData();
  const stateEncoded = formData.get("state") as string;
  const state = decodeState<{ oauthReqInfo: AuthRequest }>(stateEncoded);

  const clientId = state.oauthReqInfo.clientId;
  const cookieValue = getCookieValue(request, COOKIE_NAME);
  let approvedClients: string[] = [];

  if (cookieValue) {
    try {
      const [data, sig] = cookieValue.split(".");
      if (data && sig && (await verifySignature(data, sig, encryptionKey))) {
        approvedClients = JSON.parse(atob(data));
      }
    } catch {
      // ignore
    }
  }

  if (!approvedClients.includes(clientId)) {
    approvedClients.push(clientId);
  }

  const data = btoa(JSON.stringify(approvedClients));
  const sig = await signData(data, encryptionKey);
  const cookieStr = `${COOKIE_NAME}=${encodeURIComponent(`${data}.${sig}`)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${ONE_YEAR_IN_SECONDS}`;

  return {
    state,
    headers: { "Set-Cookie": cookieStr },
  };
}
