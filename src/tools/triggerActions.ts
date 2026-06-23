import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { tagmanager_v2 } from "googleapis";
import { z } from "zod";
import { McpAgentToolParamsModel } from "../models/McpAgentModel";
import { TriggerSchema } from "../schemas/TriggerSchema";
import {
  createErrorResponse,
  getTagManagerClient,
  log,
  paginateArray,
} from "../utils";
import Schema$Trigger = tagmanager_v2.Schema$Trigger;

const PayloadSchema = TriggerSchema.omit({
  accountId: true,
  containerId: true,
  workspaceId: true,
  triggerId: true,
  fingerprint: true,
});

const ITEMS_PER_PAGE = 20;

export const triggerActions = (
  server: McpServer,
  { props }: McpAgentToolParamsModel,
): void => {
  server.tool(
    "gtm_trigger",
    `Performs GTM trigger operations: create, get, list, update, remove, revert. List returns up to ${ITEMS_PER_PAGE} items per page.`,
    {
      action: z
        .enum(["create", "get", "list", "update", "remove", "revert"])
        .describe("The GTM trigger operation to perform."),
      accountId: z.string().describe("GTM Account ID."),
      containerId: z.string().describe("GTM Container ID."),
      workspaceId: z.string().describe("GTM Workspace ID."),
      triggerId: z.string().optional().describe("GTM Trigger ID. Required for get, update, remove, revert."),
      createOrUpdateConfig: PayloadSchema.optional().describe("Config for create/update."),
      fingerprint: z.string().optional().describe("Fingerprint for update/revert."),
      page: z.number().min(1).default(1).describe("Page number."),
      itemsPerPage: z.number().min(1).max(ITEMS_PER_PAGE).default(ITEMS_PER_PAGE).describe("Items per page."),
    },
    async ({ action, accountId, containerId, workspaceId, triggerId, createOrUpdateConfig, fingerprint, page, itemsPerPage }) => {
      log(`Running tool: gtm_trigger with action ${action}`);

      try {
        const tagmanager = await getTagManagerClient(props);
        const basePath = `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`;

        switch (action) {
          case "create": {
            if (!createOrUpdateConfig) throw new Error(`createOrUpdateConfig is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.triggers.create({
              parent: basePath,
              requestBody: createOrUpdateConfig as Schema$Trigger,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "get": {
            if (!triggerId) throw new Error(`triggerId is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.triggers.get({
              path: `${basePath}/triggers/${triggerId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "list": {
            let all: Schema$Trigger[] = [];
            let currentPageToken = "";
            do {
              const response = await tagmanager.accounts.containers.workspaces.triggers.list({
                parent: basePath,
                pageToken: currentPageToken,
              });
              if (response.data.trigger) all = all.concat(response.data.trigger);
              currentPageToken = response.data.nextPageToken || "";
            } while (currentPageToken);
            return { content: [{ type: "text", text: JSON.stringify(paginateArray(all, page, itemsPerPage), null, 2) }] };
          }
          case "update": {
            if (!triggerId) throw new Error(`triggerId is required for ${action}`);
            if (!createOrUpdateConfig) throw new Error(`createOrUpdateConfig is required for ${action}`);
            if (!fingerprint) throw new Error(`fingerprint is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.triggers.update({
              path: `${basePath}/triggers/${triggerId}`,
              fingerprint,
              requestBody: createOrUpdateConfig as Schema$Trigger,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "remove": {
            if (!triggerId) throw new Error(`triggerId is required for ${action}`);
            await tagmanager.accounts.containers.workspaces.triggers.delete({
              path: `${basePath}/triggers/${triggerId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Trigger ${triggerId} deleted` }, null, 2) }] };
          }
          case "revert": {
            if (!triggerId) throw new Error(`triggerId is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.triggers.revert({
              path: `${basePath}/triggers/${triggerId}`,
              fingerprint,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error) {
        return createErrorResponse(`Error performing ${action} on GTM trigger`, error);
      }
    },
  );
};
