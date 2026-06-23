import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockEnv, createMockMcpServer, createMockProps } from "./helpers";

const { variables } = vi.hoisted(() => {
  const variables = {
    create: vi.fn().mockResolvedValue({ data: { variableId: "v1", name: "New" } }),
    get: vi.fn().mockResolvedValue({ data: { variableId: "v1", name: "Test" } }),
    list: vi.fn().mockResolvedValue({ data: { variable: [{ variableId: "v1" }], nextPageToken: "" } }),
    update: vi.fn().mockResolvedValue({ data: { variableId: "v1", name: "Updated" } }),
    delete: vi.fn().mockResolvedValue({}),
    revert: vi.fn().mockResolvedValue({ data: { variable: { variableId: "v1" } } }),
  };
  return { variables };
});

vi.mock("../../utils/getTagManagerClient", () => ({
  getTagManagerClient: vi.fn().mockResolvedValue({
    accounts: { containers: { workspaces: { variables } } },
  }),
}));
vi.mock("../../utils/log", () => ({ log: vi.fn() }));

import { variableActions } from "../variableActions";

describe("variableActions", () => {
  let server: ReturnType<typeof createMockMcpServer>;
  const env = createMockEnv();
  const props = createMockProps();
  const base = { accountId: "123", containerId: "456", workspaceId: "789", page: 1, itemsPerPage: 20 };

  beforeEach(() => {
    vi.clearAllMocks();
    variables.create.mockResolvedValue({ data: { variableId: "v1", name: "New" } });
    variables.get.mockResolvedValue({ data: { variableId: "v1", name: "Test" } });
    variables.list.mockResolvedValue({ data: { variable: [{ variableId: "v1" }], nextPageToken: "" } });
    variables.update.mockResolvedValue({ data: { variableId: "v1", name: "Updated" } });
    variables.delete.mockResolvedValue({});
    variables.revert.mockResolvedValue({ data: { variable: { variableId: "v1" } } });
    server = createMockMcpServer();
    variableActions(server as any, { props, env });
  });

  it("registers gtm_variable", () => { expect(server.getRegisteredTools().has("gtm_variable")).toBe(true); });

  it("create creates variable", async () => {
    const r = await server.callTool("gtm_variable", { ...base, action: "create", createOrUpdateConfig: { name: "New" } });
    expect(JSON.parse(r.content[0].text).variableId).toBe("v1");
  });

  it("get returns variable", async () => {
    const r = await server.callTool("gtm_variable", { ...base, action: "get", variableId: "v1" });
    expect(JSON.parse(r.content[0].text).variableId).toBe("v1");
  });

  it("list returns paginated", async () => {
    const r = await server.callTool("gtm_variable", { ...base, action: "list" });
    expect(JSON.parse(r.content[0].text).items).toHaveLength(1);
  });

  it("update requires fingerprint", async () => {
    const r = await server.callTool("gtm_variable", { ...base, action: "update", variableId: "v1", createOrUpdateConfig: { name: "X" } });
    expect(JSON.parse(r.content[0].text).error).toBe(true);
  });

  it("update with all params succeeds", async () => {
    const r = await server.callTool("gtm_variable", { ...base, action: "update", variableId: "v1", createOrUpdateConfig: { name: "X" }, fingerprint: "abc" });
    expect(JSON.parse(r.content[0].text).variableId).toBe("v1");
  });

  it("remove deletes variable", async () => {
    const r = await server.callTool("gtm_variable", { ...base, action: "remove", variableId: "v1" });
    expect(JSON.parse(r.content[0].text).success).toBe(true);
  });
});
