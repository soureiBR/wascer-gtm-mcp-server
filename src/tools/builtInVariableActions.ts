import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { tagmanager_v2 } from "googleapis";
import { z } from "zod";
import { McpAgentToolParamsModel } from "../models/McpAgentModel";
import {
  createErrorResponse,
  getTagManagerClient,
  log,
  paginateArray,
} from "../utils";
import Schema$BuiltInVariable = tagmanager_v2.Schema$BuiltInVariable;

const ITEMS_PER_PAGE = 50;

export const builtInVariableActions = (
  server: McpServer,
  { props }: McpAgentToolParamsModel,
): void => {
  server.tool(
    "gtm_built_in_variable",
    "Performs built-in variable operations: create (enable), list, remove, revert. Use 'types' array to enable multiple at once.",
    {
      action: z
        .enum(["create", "list", "remove", "revert"])
        .describe("The built-in variable operation. 'create' enables built-in variables."),
      accountId: z.string().describe("GTM Account ID."),
      containerId: z.string().describe("GTM Container ID."),
      workspaceId: z.string().describe("GTM Workspace ID."),
      types: z
        .array(z.string())
        .optional()
        .describe("Array of built-in variable types to enable/remove. E.g. ['pageUrl', 'pagePath', 'event', 'clickElement', 'clickId']."),
      type: z
        .string()
        .optional()
        .describe("Single built-in variable type. Required for 'revert'."),
      page: z.number().min(1).default(1).describe("Page number."),
      itemsPerPage: z.number().min(1).max(ITEMS_PER_PAGE).default(ITEMS_PER_PAGE).describe("Items per page."),
    },
    async ({ action, accountId, containerId, workspaceId, types, type, page, itemsPerPage }) => {
      log(`Running tool: gtm_built_in_variable with action ${action}`);

      try {
        const tagmanager = await getTagManagerClient(props);
        const parent = `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`;

        switch (action) {
          case "create": {
            if (!types || types.length === 0) throw new Error(`types array is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.built_in_variables.create({
              parent,
              type: types,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "list": {
            let all: Schema$BuiltInVariable[] = [];
            let currentPageToken = "";
            do {
              const response = await tagmanager.accounts.containers.workspaces.built_in_variables.list({
                parent,
                pageToken: currentPageToken,
              });
              if (response.data.builtInVariable) all = all.concat(response.data.builtInVariable);
              currentPageToken = response.data.nextPageToken || "";
            } while (currentPageToken);
            return { content: [{ type: "text", text: JSON.stringify(paginateArray(all, page, itemsPerPage), null, 2) }] };
          }
          case "remove": {
            if (!types || types.length === 0) throw new Error(`types array is required for ${action}`);
            await tagmanager.accounts.containers.workspaces.built_in_variables.delete({
              path: `${parent}/built_in_variables`,
              type: types,
            });
            return { content: [{ type: "text", text: JSON.stringify({ success: true, message: "Built-in variables removed" }, null, 2) }] };
          }
          case "revert": {
            if (!type) throw new Error(`type is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.built_in_variables.revert({
              path: `${parent}/built_in_variables`,
              type,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error) {
        return createErrorResponse(`Error performing ${action} on built-in variable`, error);
      }
    },
  );
};
