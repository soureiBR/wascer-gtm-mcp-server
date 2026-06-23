import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("googleapis", () => {
  const mockTagmanager = { accounts: { list: vi.fn() } };
  return {
    google: {
      auth: {
        GoogleAuth: class {
          constructor() {}
        },
      },
      tagmanager: vi.fn().mockReturnValue(mockTagmanager),
    },
  };
});

vi.mock("./log", () => ({ log: vi.fn() }));

describe("getTagManagerClient", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("throws when no SA and no accessToken", async () => {
    const { getTagManagerClient } = await import("./getTagManagerClient");
    const props = { userId: "u1", name: "Test", email: "t@t.com", accessToken: "", clientId: "c1" };
    await expect(getTagManagerClient(props)).rejects.toThrow("No GTM access available");
  });

  it("creates client with OAuth token", async () => {
    const { getTagManagerClient } = await import("./getTagManagerClient");
    const props = { userId: "u1", name: "Test", email: "t@t.com", accessToken: "valid-token", clientId: "c1" };
    const client = await getTagManagerClient(props);
    expect(client).toBeDefined();
    expect(client.accounts).toBeDefined();
  });

  it("creates client with Service Account when stored", async () => {
    const { ServiceAccountStore } = await import("./serviceAccountStore");
    const { getTagManagerClient } = await import("./getTagManagerClient");

    const credentials = { type: "service_account", project_id: "test" };
    ServiceAccountStore.set("u2", btoa(JSON.stringify(credentials)));

    const props = { userId: "u2", name: "Test", email: "t@t.com", accessToken: "token", clientId: "c1" };
    const client = await getTagManagerClient(props);
    expect(client).toBeDefined();

    ServiceAccountStore.remove("u2");
  });

  it("throws on expired token", async () => {
    const { getTagManagerClient } = await import("./getTagManagerClient");
    const props = {
      userId: "u3", name: "Test", email: "t@t.com",
      accessToken: "expired-token", clientId: "c1",
      expiresAt: Math.floor(Date.now() / 1000) - 100,
    };
    await expect(getTagManagerClient(props)).rejects.toThrow("Access token expired");
  });
});
