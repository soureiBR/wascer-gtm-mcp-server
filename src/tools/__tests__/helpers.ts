import { vi } from "vitest";

export function createMockTagManager() {
  return {
    accounts: {
      get: vi.fn().mockResolvedValue({ data: { accountId: "123", name: "Test Account" } }),
      list: vi.fn().mockResolvedValue({ data: { account: [{ accountId: "123", name: "Test Account" }] } }),
      update: vi.fn().mockResolvedValue({ data: { accountId: "123", name: "Updated" } }),
      containers: {
        create: vi.fn().mockResolvedValue({ data: { containerId: "456", name: "New Container" } }),
        get: vi.fn().mockResolvedValue({ data: { containerId: "456", name: "Test Container" } }),
        list: vi.fn().mockResolvedValue({ data: { container: [{ containerId: "456" }], nextPageToken: "" } }),
        update: vi.fn().mockResolvedValue({ data: { containerId: "456", name: "Updated" } }),
        delete: vi.fn().mockResolvedValue({}),
        snippet: vi.fn().mockResolvedValue({ data: { snippet: "<script>...</script>" } }),
        workspaces: {
          create: vi.fn().mockResolvedValue({ data: { workspaceId: "789", name: "New Workspace" } }),
          get: vi.fn().mockResolvedValue({ data: { workspaceId: "789", name: "Default" } }),
          list: vi.fn().mockResolvedValue({ data: { workspace: [{ workspaceId: "789" }], nextPageToken: "" } }),
          update: vi.fn().mockResolvedValue({ data: { workspaceId: "789", name: "Updated" } }),
          delete: vi.fn().mockResolvedValue({}),
          create_version: vi.fn().mockResolvedValue({ data: { containerVersion: { containerVersionId: "1" } } }),
          getStatus: vi.fn().mockResolvedValue({ data: { workspaceChange: [] } }),
          sync: vi.fn().mockResolvedValue({ data: { synced: true } }),
          tags: {
            create: vi.fn().mockResolvedValue({ data: { tagId: "t1", name: "New Tag" } }),
            get: vi.fn().mockResolvedValue({ data: { tagId: "t1", name: "Test Tag" } }),
            list: vi.fn().mockResolvedValue({ data: { tag: [{ tagId: "t1" }], nextPageToken: "" } }),
            update: vi.fn().mockResolvedValue({ data: { tagId: "t1", name: "Updated" } }),
            delete: vi.fn().mockResolvedValue({}),
            revert: vi.fn().mockResolvedValue({ data: { tag: { tagId: "t1" } } }),
          },
          triggers: {
            create: vi.fn().mockResolvedValue({ data: { triggerId: "tr1", name: "New Trigger" } }),
            get: vi.fn().mockResolvedValue({ data: { triggerId: "tr1", name: "Test Trigger" } }),
            list: vi.fn().mockResolvedValue({ data: { trigger: [{ triggerId: "tr1" }], nextPageToken: "" } }),
            update: vi.fn().mockResolvedValue({ data: { triggerId: "tr1", name: "Updated" } }),
            delete: vi.fn().mockResolvedValue({}),
            revert: vi.fn().mockResolvedValue({ data: { trigger: { triggerId: "tr1" } } }),
          },
          variables: {
            create: vi.fn().mockResolvedValue({ data: { variableId: "v1", name: "New Variable" } }),
            get: vi.fn().mockResolvedValue({ data: { variableId: "v1", name: "Test Variable" } }),
            list: vi.fn().mockResolvedValue({ data: { variable: [{ variableId: "v1" }], nextPageToken: "" } }),
            update: vi.fn().mockResolvedValue({ data: { variableId: "v1", name: "Updated" } }),
            delete: vi.fn().mockResolvedValue({}),
            revert: vi.fn().mockResolvedValue({ data: { variable: { variableId: "v1" } } }),
          },
        },
      },
    },
  };
}

export function createMockEnv(): Env {
  return {
    GOOGLE_CLIENT_ID: "test-client-id",
    GOOGLE_CLIENT_SECRET: "test-client-secret",
    COOKIE_ENCRYPTION_KEY: "test-key",
    WORKER_HOST: "https://test.workers.dev",
    MCP_OBJECT: {} as any,
    OAUTH_KV: {} as any,
  };
}

export function createMockProps() {
  return {
    userId: "u1",
    name: "Test",
    email: "test@test.com",
    accessToken: "mock-token",
    clientId: "mock-client-id",
  };
}

export function createMockMcpServer() {
  const registeredTools: Map<string, { description: string; schema: any; handler: Function }> = new Map();

  return {
    tool: vi.fn((name: string, description: string, schema: any, handler?: Function) => {
      const actualHandler = handler || schema;
      const actualSchema = handler ? schema : {};
      registeredTools.set(name, { description, schema: actualSchema, handler: actualHandler });
    }),
    getRegisteredTools: () => registeredTools,
    callTool: async (name: string, args: any) => {
      const tool = registeredTools.get(name);
      if (!tool) throw new Error(`Tool ${name} not registered`);
      return tool.handler(args);
    },
  };
}
