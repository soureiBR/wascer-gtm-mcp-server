import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockEnv, createMockMcpServer, createMockProps } from "./helpers";

const { tags } = vi.hoisted(() => {
  const tags = {
    create: vi.fn().mockResolvedValue({ data: { tagId: "t1", name: "New" } }),
    get: vi.fn().mockResolvedValue({ data: { tagId: "t1", name: "Test" } }),
    list: vi.fn().mockResolvedValue({ data: { tag: [{ tagId: "t1" }], nextPageToken: "" } }),
    update: vi.fn().mockResolvedValue({ data: { tagId: "t1", name: "Updated" } }),
    delete: vi.fn().mockResolvedValue({}),
    revert: vi.fn().mockResolvedValue({ data: { tag: { tagId: "t1" } } }),
  };
  return { tags };
});

vi.mock("../../utils/getTagManagerClient", () => ({
  getTagManagerClient: vi.fn().mockResolvedValue({
    accounts: { containers: { workspaces: { tags } } },
  }),
}));
vi.mock("../../utils/log", () => ({ log: vi.fn() }));

import { tagActions } from "../tagActions";

describe("tagActions", () => {
  let server: ReturnType<typeof createMockMcpServer>;
  const env = createMockEnv();
  const props = createMockProps();
  const base = { accountId: "123", containerId: "456", workspaceId: "789", page: 1, itemsPerPage: 20 };

  beforeEach(() => {
    vi.clearAllMocks();
    tags.create.mockResolvedValue({ data: { tagId: "t1", name: "New" } });
    tags.get.mockResolvedValue({ data: { tagId: "t1", name: "Test" } });
    tags.list.mockResolvedValue({ data: { tag: [{ tagId: "t1" }], nextPageToken: "" } });
    tags.update.mockResolvedValue({ data: { tagId: "t1", name: "Updated" } });
    tags.delete.mockResolvedValue({});
    tags.revert.mockResolvedValue({ data: { tag: { tagId: "t1" } } });
    server = createMockMcpServer();
    tagActions(server as any, { props, env });
  });

  it("registers gtm_tag", () => { expect(server.getRegisteredTools().has("gtm_tag")).toBe(true); });

  it("create creates tag", async () => {
    const r = await server.callTool("gtm_tag", { ...base, action: "create", createOrUpdateConfig: { name: "New", type: "html" } });
    expect(JSON.parse(r.content[0].text).tagId).toBe("t1");
  });

  it("get requires tagId", async () => {
    const r = await server.callTool("gtm_tag", { ...base, action: "get" });
    expect(JSON.parse(r.content[0].text).error).toBe(true);
  });

  it("list returns paginated", async () => {
    const r = await server.callTool("gtm_tag", { ...base, action: "list" });
    expect(JSON.parse(r.content[0].text).items).toBeDefined();
  });

  it("update requires fingerprint", async () => {
    const r = await server.callTool("gtm_tag", { ...base, action: "update", tagId: "t1", createOrUpdateConfig: { name: "X" } });
    expect(JSON.parse(r.content[0].text).error).toBe(true);
  });

  it("remove deletes tag", async () => {
    const r = await server.callTool("gtm_tag", { ...base, action: "remove", tagId: "t1" });
    expect(JSON.parse(r.content[0].text).success).toBe(true);
  });

  it("revert reverts tag", async () => {
    const r = await server.callTool("gtm_tag", { ...base, action: "revert", tagId: "t1" });
    expect(JSON.parse(r.content[0].text).tag).toBeDefined();
  });
});
