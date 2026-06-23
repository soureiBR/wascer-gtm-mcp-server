import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { tagmanager_v2 } from "googleapis";
import { z } from "zod";
import { McpAgentToolParamsModel } from "../models/McpAgentModel";
import { ClientSchema } from "../schemas/ClientSchema";
import {
  createErrorResponse,
  getTagManagerClient,
  log,
  paginateArray,
} from "../utils";
import Schema$Client = tagmanager_v2.Schema$Client;

const PayloadSchema = ClientSchema.omit({
  accountId: true,
  containerId: true,
  workspaceId: true,
  clientId: true,
  fingerprint: true,
});

const ITEMS_PER_PAGE = 50;

export const clientActions = (
  server: McpServer,
  { props }: McpAgentToolParamsModel,
): void => {
  server.tool(
    "gtm_client",
    "Performs server-side client operations: create, get, list, update, remove, revert. Clients are only available in server containers.",
    {
      action: z
        .enum(["create", "get", "list", "update", "remove", "revert"])
        .describe("The client operation to perform."),
      accountId: z.string().describe("GTM Account ID."),
      containerId: z.string().describe("GTM Container ID (must be a server container)."),
      workspaceId: z.string().describe("GTM Workspace ID."),
      clientId: z.string().optional().describe("GTM Client ID. Required for get, update, remove, revert."),
      createOrUpdateConfig: PayloadSchema.optional().describe("Config for create/update."),
      fingerprint: z.string().optional().describe("Fingerprint for update/revert."),
      page: z.number().min(1).default(1).describe("Page number."),
      itemsPerPage: z.number().min(1).max(ITEMS_PER_PAGE).default(ITEMS_PER_PAGE).describe("Items per page."),
    },
    async ({ action, accountId, containerId, workspaceId, clientId, createOrUpdateConfig, fingerprint, page, itemsPerPage }) => {
      log(`Running tool: gtm_client with action ${action}`);

      try {
        const tagmanager = await getTagManagerClient(props);
        const basePath = `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`;

        switch (action) {
          case "create": {
            if (!createOrUpdateConfig) throw new Error(`createOrUpdateConfig is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.clients.create({
              parent: basePath,
              requestBody: createOrUpdateConfig as Schema$Client,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "get": {
            if (!clientId) throw new Error(`clientId is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.clients.get({
              path: `${basePath}/clients/${clientId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "list": {
            let all: Schema$Client[] = [];
            let currentPageToken = "";
            do {
              const response = await tagmanager.accounts.containers.workspaces.clients.list({
                parent: basePath,
                pageToken: currentPageToken,
              });
              if (response.data.client) all = all.concat(response.data.client);
              currentPageToken = response.data.nextPageToken || "";
            } while (currentPageToken);
            return { content: [{ type: "text", text: JSON.stringify(paginateArray(all, page, itemsPerPage), null, 2) }] };
          }
          case "update": {
            if (!clientId) throw new Error(`clientId is required for ${action}`);
            if (!createOrUpdateConfig) throw new Error(`createOrUpdateConfig is required for ${action}`);
            if (!fingerprint) throw new Error(`fingerprint is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.clients.update({
              path: `${basePath}/clients/${clientId}`,
              fingerprint,
              requestBody: createOrUpdateConfig as Schema$Client,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "remove": {
            if (!clientId) throw new Error(`clientId is required for ${action}`);
            await tagmanager.accounts.containers.workspaces.clients.delete({
              path: `${basePath}/clients/${clientId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Client ${clientId} deleted` }, null, 2) }] };
          }
          case "revert": {
            if (!clientId) throw new Error(`clientId is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.clients.revert({
              path: `${basePath}/clients/${clientId}`,
              fingerprint,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error) {
        return createErrorResponse(`Error performing ${action} on client`, error);
      }
    },
  );
};
