import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockEnv, createMockMcpServer, createMockProps } from "./helpers";

const { mockAccounts } = vi.hoisted(() => {
  const mockAccounts = {
    get: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    containers: {},
  };
  return { mockAccounts };
});

vi.mock("../../utils/getTagManagerClient", () => ({
  getTagManagerClient: vi.fn().mockResolvedValue({ accounts: mockAccounts }),
}));

vi.mock("../../utils/log", () => ({ log: vi.fn() }));

import { accountActions } from "../accountActions";

describe("accountActions", () => {
  let server: ReturnType<typeof createMockMcpServer>;
  const env = createMockEnv();
  const props = createMockProps();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAccounts.get.mockResolvedValue({ data: { accountId: "123", name: "Test Account" } });
    mockAccounts.list.mockResolvedValue({ data: { account: [{ accountId: "123" }] } });
    mockAccounts.update.mockResolvedValue({ data: { accountId: "123", name: "Updated" } });
    server = createMockMcpServer();
    accountActions(server as any, { props, env });
  });

  it("registers gtm_account tool", () => {
    expect(server.getRegisteredTools().has("gtm_account")).toBe(true);
  });

  it("list returns accounts", async () => {
    const result = await server.callTool("gtm_account", { action: "list", accountId: "123" });
    const data = JSON.parse(result.content[0].text);
    expect(data.account).toBeDefined();
  });

  it("get returns account", async () => {
    const result = await server.callTool("gtm_account", { action: "get", accountId: "123" });
    const data = JSON.parse(result.content[0].text);
    expect(data.accountId).toBe("123");
  });

  it("update requires config", async () => {
    const result = await server.callTool("gtm_account", { action: "update", accountId: "123" });
    const data = JSON.parse(result.content[0].text);
    expect(data.error).toBe(true);
  });

  it("update with config succeeds", async () => {
    const result = await server.callTool("gtm_account", { action: "update", accountId: "123", config: { name: "Updated" } });
    const data = JSON.parse(result.content[0].text);
    expect(data.name).toBe("Updated");
  });
});
