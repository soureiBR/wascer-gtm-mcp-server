export function getUpstreamAuthorizeUrl({
  upstreamUrl,
  clientId,
  scope,
  redirectUri,
  state,
  hasRefreshToken,
}: {
  upstreamUrl: string;
  clientId: string;
  scope: string;
  redirectUri: string;
  state?: string;
  hasRefreshToken?: boolean;
}): string {
  const upstream = new URL(upstreamUrl);
  upstream.searchParams.set("client_id", clientId);
  upstream.searchParams.set("redirect_uri", redirectUri);
  upstream.searchParams.set("scope", scope);
  upstream.searchParams.set("response_type", "code");
  upstream.searchParams.set("access_type", "offline");
  if (state) upstream.searchParams.set("state", state);
  if (!hasRefreshToken) {
    upstream.searchParams.set("prompt", "consent");
  }
  return upstream.href;
}

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
}

export interface GoogleRefreshResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

export async function fetchUpstreamAuthToken({
  clientId,
  clientSecret,
  code,
  redirectUri,
  upstreamUrl,
  grantType,
}: {
  code: string | undefined;
  upstreamUrl: string;
  clientSecret: string;
  redirectUri: string;
  clientId: string;
  grantType: string;
}): Promise<[GoogleTokenResponse, null] | [null, Response]> {
  if (!code) {
    return [null, new Response("Missing code", { status: 400 })];
  }

  const resp = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: grantType,
    }).toString(),
  });

  if (!resp.ok) {
    console.log(await resp.text());
    return [
      null,
      new Response("Failed to fetch access token", { status: 500 }),
    ];
  }

  const body = (await resp.json()) as GoogleTokenResponse;
  if (!body.access_token) {
    return [null, new Response("Missing access token", { status: 400 })];
  }
  return [body, null];
}

export async function refreshUpstreamAuthToken({
  clientId,
  clientSecret,
  refreshToken,
  upstreamUrl,
}: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  upstreamUrl: string;
}): Promise<[GoogleRefreshResponse, null] | [null, string]> {
  const resp = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }).toString(),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    return [null, errorText];
  }

  const body = (await resp.json()) as GoogleRefreshResponse;
  if (!body.access_token) {
    return [null, "Missing access token in refresh response"];
  }

  return [body, null];
}

export type Props = {
  userId: string;
  clientId: string;
  name: string;
  email: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
};

export async function handleTokenExchangeCallback(
  { grantType, props }: { grantType: string; props?: any },
  env: Env,
) {
  const now = Math.floor(Date.now() / 1000);

  if (grantType === "authorization_code") {
    return { accessTokenTTL: 1800 };
  }

  if (grantType === "refresh_token") {
    const p = props as Props;
    if (!p?.refreshToken) {
      console.error("[TokenExchange] Missing Google refresh token.");
      throw new Error("Missing Google refresh token. Please re-authenticate.");
    }

    const expiresAt = p.expiresAt ?? 0;
    const REFRESH_THRESHOLD = 900;
    if (expiresAt >= now + REFRESH_THRESHOLD) {
      return { accessTokenTTL: 1800 };
    }

    console.log("[TokenExchange] Refreshing Google auth token...");
    const [token, err] = await refreshUpstreamAuthToken({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      refreshToken: p.refreshToken,
      upstreamUrl: "https://oauth2.googleapis.com/token",
    });

    if (!token) {
      console.error(`[TokenExchange] Google refresh failed: ${err}`);
      throw new Error(`Google refresh failed: ${err}. Please re-authenticate.`);
    }

    return {
      newProps: {
        ...p,
        accessToken: token.access_token,
        expiresAt: now + token.expires_in,
        refreshToken: token.refresh_token || p.refreshToken,
      } satisfies Props,
      accessTokenTTL: 1800,
    };
  }
}
