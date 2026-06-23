import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { tagmanager_v2 } from "googleapis";
import { z } from "zod";
import { McpAgentToolParamsModel } from "../models/McpAgentModel";
import { VariableSchema } from "../schemas/VariableSchema";
import {
  createErrorResponse,
  getTagManagerClient,
  log,
  paginateArray,
} from "../utils";
import Schema$Variable = tagmanager_v2.Schema$Variable;

const PayloadSchema = VariableSchema.omit({
  accountId: true,
  containerId: true,
  workspaceId: true,
  variableId: true,
  fingerprint: true,
});

const ITEMS_PER_PAGE = 20;

export const variableActions = (
  server: McpServer,
  { props }: McpAgentToolParamsModel,
): void => {
  server.tool(
    "gtm_variable",
    `Performs GTM variable operations: create, get, list, update, remove, revert. List returns up to ${ITEMS_PER_PAGE} items per page.`,
    {
      action: z
        .enum(["create", "get", "list", "update", "remove", "revert"])
        .describe("The GTM variable operation to perform."),
      accountId: z.string().describe("GTM Account ID."),
      containerId: z.string().describe("GTM Container ID."),
      workspaceId: z.string().describe("GTM Workspace ID."),
      variableId: z.string().optional().describe("GTM Variable ID. Required for get, update, remove, revert."),
      createOrUpdateConfig: PayloadSchema.optional().describe("Config for create/update."),
      fingerprint: z.string().optional().describe("Fingerprint for update/revert."),
      page: z.number().min(1).default(1).describe("Page number."),
      itemsPerPage: z.number().min(1).max(ITEMS_PER_PAGE).default(ITEMS_PER_PAGE).describe("Items per page."),
    },
    async ({ action, accountId, containerId, workspaceId, variableId, createOrUpdateConfig, fingerprint, page, itemsPerPage }) => {
      log(`Running tool: gtm_variable with action ${action}`);

      try {
        const tagmanager = await getTagManagerClient(props);
        const basePath = `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`;

        switch (action) {
          case "create": {
            if (!createOrUpdateConfig) throw new Error(`createOrUpdateConfig is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.variables.create({
              parent: basePath,
              requestBody: createOrUpdateConfig as Schema$Variable,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "get": {
            if (!variableId) throw new Error(`variableId is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.variables.get({
              path: `${basePath}/variables/${variableId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "list": {
            let all: Schema$Variable[] = [];
            let currentPageToken = "";
            do {
              const response = await tagmanager.accounts.containers.workspaces.variables.list({
                parent: basePath,
                pageToken: currentPageToken,
              });
              if (response.data.variable) all = all.concat(response.data.variable);
              currentPageToken = response.data.nextPageToken || "";
            } while (currentPageToken);
            return { content: [{ type: "text", text: JSON.stringify(paginateArray(all, page, itemsPerPage), null, 2) }] };
          }
          case "update": {
            if (!variableId) throw new Error(`variableId is required for ${action}`);
            if (!createOrUpdateConfig) throw new Error(`createOrUpdateConfig is required for ${action}`);
            if (!fingerprint) throw new Error(`fingerprint is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.variables.update({
              path: `${basePath}/variables/${variableId}`,
              fingerprint,
              requestBody: createOrUpdateConfig as Schema$Variable,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "remove": {
            if (!variableId) throw new Error(`variableId is required for ${action}`);
            await tagmanager.accounts.containers.workspaces.variables.delete({
              path: `${basePath}/variables/${variableId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Variable ${variableId} deleted` }, null, 2) }] };
          }
          case "revert": {
            if (!variableId) throw new Error(`variableId is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.variables.revert({
              path: `${basePath}/variables/${variableId}`,
              fingerprint,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error) {
        return createErrorResponse(`Error performing ${action} on GTM variable`, error);
      }
    },
  );
};
