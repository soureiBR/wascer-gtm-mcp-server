import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { tagmanager_v2 } from "googleapis";
import { z } from "zod";
import { McpAgentToolParamsModel } from "../models/McpAgentModel";
import { WorkspaceSchema } from "../schemas/WorkspaceSchema";
import {
  createErrorResponse,
  getTagManagerClient,
  log,
  paginateArray,
} from "../utils";
import Schema$Workspace = tagmanager_v2.Schema$Workspace;

const PayloadSchema = WorkspaceSchema.omit({
  accountId: true,
  containerId: true,
  workspaceId: true,
  fingerprint: true,
});

const ITEMS_PER_PAGE = 50;

export const workspaceActions = (
  server: McpServer,
  { props }: McpAgentToolParamsModel,
): void => {
  server.tool(
    "gtm_workspace",
    `Performs workspace operations: create, get, list, update, remove, createVersion, getStatus, sync.`,
    {
      action: z
        .enum(["create", "get", "list", "update", "remove", "createVersion", "getStatus", "sync"])
        .describe("The workspace operation to perform."),
      accountId: z.string().describe("GTM Account ID."),
      containerId: z.string().describe("GTM Container ID."),
      workspaceId: z.string().optional().describe("GTM Workspace ID. Required for all except create and list."),
      createOrUpdateConfig: PayloadSchema.optional().describe("Config for create/update actions."),
      fingerprint: z.string().optional().describe("Fingerprint for update action."),
      page: z.number().min(1).default(1).describe("Page number."),
      itemsPerPage: z.number().min(1).max(ITEMS_PER_PAGE).default(ITEMS_PER_PAGE).describe("Items per page."),
    },
    async ({ action, accountId, containerId, workspaceId, createOrUpdateConfig, fingerprint, page, itemsPerPage }) => {
      log(`Running tool: gtm_workspace with action ${action}`);

      try {
        const tagmanager = await getTagManagerClient(props);

        switch (action) {
          case "create": {
            if (!createOrUpdateConfig) throw new Error(`createOrUpdateConfig is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.create({
              parent: `accounts/${accountId}/containers/${containerId}`,
              requestBody: createOrUpdateConfig as Schema$Workspace,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "get": {
            if (!workspaceId) throw new Error(`workspaceId is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.get({
              path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "list": {
            let all: Schema$Workspace[] = [];
            let currentPageToken = "";
            do {
              const response = await tagmanager.accounts.containers.workspaces.list({
                parent: `accounts/${accountId}/containers/${containerId}`,
                pageToken: currentPageToken,
              });
              if (response.data.workspace) all = all.concat(response.data.workspace);
              currentPageToken = response.data.nextPageToken || "";
            } while (currentPageToken);
            return { content: [{ type: "text", text: JSON.stringify(paginateArray(all, page, itemsPerPage), null, 2) }] };
          }
          case "update": {
            if (!workspaceId) throw new Error(`workspaceId is required for ${action}`);
            if (!createOrUpdateConfig) throw new Error(`createOrUpdateConfig is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.update({
              path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
              fingerprint,
              requestBody: createOrUpdateConfig as Schema$Workspace,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "remove": {
            if (!workspaceId) throw new Error(`workspaceId is required for ${action}`);
            await tagmanager.accounts.containers.workspaces.delete({
              path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Workspace ${workspaceId} removed` }, null, 2) }] };
          }
          case "createVersion": {
            if (!workspaceId) throw new Error(`workspaceId is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.create_version({
              path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
              requestBody: createOrUpdateConfig || {},
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "getStatus": {
            if (!workspaceId) throw new Error(`workspaceId is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.getStatus({
              path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "sync": {
            if (!workspaceId) throw new Error(`workspaceId is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.sync({
              path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error) {
        return createErrorResponse(`Error performing ${action} on workspace`, error);
      }
    },
  );
};
