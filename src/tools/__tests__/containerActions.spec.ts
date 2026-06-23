import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockEnv, createMockMcpServer, createMockProps } from "./helpers";

const { mock } = vi.hoisted(() => {
  const containers = {
    create: vi.fn().mockResolvedValue({ data: { containerId: "456", name: "New" } }),
    get: vi.fn().mockResolvedValue({ data: { containerId: "456", name: "Test" } }),
    list: vi.fn().mockResolvedValue({ data: { container: [{ containerId: "456" }], nextPageToken: "" } }),
    update: vi.fn().mockResolvedValue({ data: { containerId: "456", name: "Updated" } }),
    delete: vi.fn().mockResolvedValue({}),
    snippet: vi.fn().mockResolvedValue({ data: { snippet: "<script/>" } }),
    workspaces: {},
  };
  return { mock: { accounts: { containers } } };
});

vi.mock("../../utils/getTagManagerClient", () => ({
  getTagManagerClient: vi.fn().mockResolvedValue(mock),
}));
vi.mock("../../utils/log", () => ({ log: vi.fn() }));

import { containerActions } from "../containerActions";

describe("containerActions", () => {
  let server: ReturnType<typeof createMockMcpServer>;
  const env = createMockEnv();
  const props = createMockProps();

  beforeEach(() => {
    vi.clearAllMocks();
    mock.accounts.containers.create.mockResolvedValue({ data: { containerId: "456", name: "New" } });
    mock.accounts.containers.get.mockResolvedValue({ data: { containerId: "456", name: "Test" } });
    mock.accounts.containers.list.mockResolvedValue({ data: { container: [{ containerId: "456" }], nextPageToken: "" } });
    mock.accounts.containers.delete.mockResolvedValue({});
    mock.accounts.containers.snippet.mockResolvedValue({ data: { snippet: "<script/>" } });
    server = createMockMcpServer();
    containerActions(server as any, { props, env });
  });

  it("registers gtm_container tool", () => {
    expect(server.getRegisteredTools().has("gtm_container")).toBe(true);
  });

  it("create creates container", async () => {
    const result = await server.callTool("gtm_container", { action: "create", accountId: "123", createOrUpdateConfig: { name: "New" }, page: 1, itemsPerPage: 50 });
    expect(JSON.parse(result.content[0].text).containerId).toBe("456");
  });

  it("get requires containerId", async () => {
    const result = await server.callTool("gtm_container", { action: "get", accountId: "123", page: 1, itemsPerPage: 50 });
    expect(JSON.parse(result.content[0].text).error).toBe(true);
  });

  it("list returns paginated", async () => {
    const result = await server.callTool("gtm_container", { action: "list", accountId: "123", page: 1, itemsPerPage: 50 });
    const data = JSON.parse(result.content[0].text);
    expect(data.items).toBeDefined();
    expect(data.pagination).toBeDefined();
  });

  it("remove deletes container", async () => {
    const result = await server.callTool("gtm_container", { action: "remove", accountId: "123", containerId: "456", page: 1, itemsPerPage: 50 });
    expect(JSON.parse(result.content[0].text).success).toBe(true);
  });
});
