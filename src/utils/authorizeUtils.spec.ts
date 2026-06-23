import { describe, it, expect } from "vitest";
import {
  getUpstreamAuthorizeUrl,
  handleTokenExchangeCallback,
} from "./authorizeUtils";

describe("getUpstreamAuthorizeUrl", () => {
  it("builds correct URL with all params", () => {
    const url = getUpstreamAuthorizeUrl({
      upstreamUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      clientId: "test-client-id",
      scope: "email profile",
      redirectUri: "https://example.com/callback",
      state: "test-state",
    });

    const parsed = new URL(url);
    expect(parsed.searchParams.get("client_id")).toBe("test-client-id");
    expect(parsed.searchParams.get("scope")).toBe("email profile");
    expect(parsed.searchParams.get("redirect_uri")).toBe("https://example.com/callback");
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.get("access_type")).toBe("offline");
    expect(parsed.searchParams.get("state")).toBe("test-state");
    expect(parsed.searchParams.get("prompt")).toBe("consent");
  });

  it("omits prompt when hasRefreshToken is true", () => {
    const url = getUpstreamAuthorizeUrl({
      upstreamUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      clientId: "test",
      scope: "email",
      redirectUri: "https://example.com/callback",
      hasRefreshToken: true,
    });

    const parsed = new URL(url);
    expect(parsed.searchParams.has("prompt")).toBe(false);
  });
});

describe("handleTokenExchangeCallback", () => {
  const mockEnv = {
    GOOGLE_CLIENT_ID: "test",
    GOOGLE_CLIENT_SECRET: "test",
  } as any;

  it("returns TTL for authorization_code grant", async () => {
    const result = await handleTokenExchangeCallback(
      { grantType: "authorization_code" },
      mockEnv,
    );
    expect(result).toEqual({ accessTokenTTL: 1800 });
  });

  it("returns TTL for refresh_token when token is still valid", async () => {
    const result = await handleTokenExchangeCallback(
      {
        grantType: "refresh_token",
        props: {
          userId: "u1",
          clientId: "c1",
          name: "Test",
          email: "t@t.com",
          accessToken: "token",
          refreshToken: "refresh",
          expiresAt: Math.floor(Date.now() / 1000) + 3600,
        },
      },
      mockEnv,
    );
    expect(result).toEqual({ accessTokenTTL: 1800 });
  });

  it("throws when refresh_token is missing", async () => {
    await expect(
      handleTokenExchangeCallback(
        {
          grantType: "refresh_token",
          props: { userId: "u1", clientId: "c1", name: "T", email: "t@t.com", accessToken: "t" },
        },
        mockEnv,
      ),
    ).rejects.toThrow("Missing Google refresh token");
  });
});
