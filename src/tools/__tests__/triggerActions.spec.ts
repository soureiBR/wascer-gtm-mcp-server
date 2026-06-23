import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockEnv, createMockMcpServer, createMockProps } from "./helpers";

const { triggers } = vi.hoisted(() => {
  const triggers = {
    create: vi.fn().mockResolvedValue({ data: { triggerId: "tr1", name: "New" } }),
    get: vi.fn().mockResolvedValue({ data: { triggerId: "tr1" } }),
    list: vi.fn().mockResolvedValue({ data: { trigger: [{ triggerId: "tr1" }], nextPageToken: "" } }),
    update: vi.fn().mockResolvedValue({ data: { triggerId: "tr1" } }),
    delete: vi.fn().mockResolvedValue({}),
    revert: vi.fn().mockResolvedValue({ data: { trigger: { triggerId: "tr1" } } }),
  };
  return { triggers };
});

vi.mock("../../utils/getTagManagerClient", () => ({
  getTagManagerClient: vi.fn().mockResolvedValue({
    accounts: { containers: { workspaces: { triggers } } },
  }),
}));
vi.mock("../../utils/log", () => ({ log: vi.fn() }));

import { triggerActions } from "../triggerActions";

describe("triggerActions", () => {
  let server: ReturnType<typeof createMockMcpServer>;
  const env = createMockEnv();
  const props = createMockProps();
  const base = { accountId: "123", containerId: "456", workspaceId: "789", page: 1, itemsPerPage: 20 };

  beforeEach(() => {
    vi.clearAllMocks();
    triggers.create.mockResolvedValue({ data: { triggerId: "tr1", name: "New" } });
    triggers.list.mockResolvedValue({ data: { trigger: [{ triggerId: "tr1" }], nextPageToken: "" } });
    triggers.delete.mockResolvedValue({});
    server = createMockMcpServer();
    triggerActions(server as any, { props, env });
  });

  it("registers gtm_trigger", () => { expect(server.getRegisteredTools().has("gtm_trigger")).toBe(true); });

  it("create creates trigger", async () => {
    const r = await server.callTool("gtm_trigger", { ...base, action: "create", createOrUpdateConfig: { name: "New" } });
    expect(JSON.parse(r.content[0].text).triggerId).toBe("tr1");
  });

  it("list returns triggers", async () => {
    const r = await server.callTool("gtm_trigger", { ...base, action: "list" });
    expect(JSON.parse(r.content[0].text).items).toHaveLength(1);
  });

  it("remove deletes trigger", async () => {
    const r = await server.callTool("gtm_trigger", { ...base, action: "remove", triggerId: "tr1" });
    expect(JSON.parse(r.content[0].text).success).toBe(true);
  });
});
