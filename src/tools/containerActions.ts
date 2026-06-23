import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { tagmanager_v2 } from "googleapis";
import { z } from "zod";
import { McpAgentToolParamsModel } from "../models/McpAgentModel";
import { ContainerSchema } from "../schemas/ContainerSchema";
import {
  createErrorResponse,
  getTagManagerClient,
  log,
  paginateArray,
} from "../utils";
import Schema$Container = tagmanager_v2.Schema$Container;

const PayloadSchema = ContainerSchema.omit({
  accountId: true,
  containerId: true,
  fingerprint: true,
});

const ITEMS_PER_PAGE = 50;

export const containerActions = (
  server: McpServer,
  { props }: McpAgentToolParamsModel,
): void => {
  server.tool(
    "gtm_container",
    `Performs container operations: create, get, list, update, remove, snippet.`,
    {
      action: z
        .enum(["create", "get", "list", "update", "remove", "snippet"])
        .describe("The container operation to perform."),
      accountId: z.string().describe("The unique ID of the GTM Account."),
      containerId: z
        .string()
        .optional()
        .describe("The unique ID of the GTM Container. Required for get, update, remove, snippet."),
      createOrUpdateConfig: PayloadSchema.optional().describe(
        "Configuration for 'create' and 'update' actions.",
      ),
      fingerprint: z
        .string()
        .optional()
        .describe("Fingerprint for optimistic concurrency. Required for 'update'."),
      page: z.number().min(1).default(1).describe("Page number for pagination."),
      itemsPerPage: z
        .number()
        .min(1)
        .max(ITEMS_PER_PAGE)
        .default(ITEMS_PER_PAGE)
        .describe(`Items per page (1-${ITEMS_PER_PAGE}).`),
    },
    async ({
      action,
      accountId,
      containerId,
      createOrUpdateConfig,
      fingerprint,
      page,
      itemsPerPage,
    }) => {
      log(`Running tool: gtm_container with action ${action}`);

      try {
        const tagmanager = await getTagManagerClient(props);

        switch (action) {
          case "create": {
            if (!createOrUpdateConfig) {
              throw new Error(`createOrUpdateConfig is required for ${action} action`);
            }
            const response = await tagmanager.accounts.containers.create({
              parent: `accounts/${accountId}`,
              requestBody: createOrUpdateConfig,
            });
            return {
              content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
            };
          }
          case "get": {
            if (!containerId) throw new Error(`containerId is required for ${action} action`);
            const response = await tagmanager.accounts.containers.get({
              path: `accounts/${accountId}/containers/${containerId}`,
            });
            return {
              content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
            };
          }
          case "list": {
            let all: Schema$Container[] = [];
            let currentPageToken = "";
            do {
              const response = await tagmanager.accounts.containers.list({
                parent: `accounts/${accountId}`,
                pageToken: currentPageToken,
              });
              if (response.data.container) {
                all = all.concat(response.data.container);
              }
              currentPageToken = response.data.nextPageToken || "";
            } while (currentPageToken);

            return {
              content: [{ type: "text", text: JSON.stringify(paginateArray(all, page, itemsPerPage), null, 2) }],
            };
          }
          case "update": {
            if (!containerId) throw new Error(`containerId is required for ${action} action`);
            if (!createOrUpdateConfig) throw new Error(`createOrUpdateConfig is required for ${action} action`);
            if (!fingerprint) throw new Error(`fingerprint is required for ${action} action`);
            const response = await tagmanager.accounts.containers.update({
              path: `accounts/${accountId}/containers/${containerId}`,
              fingerprint,
              requestBody: createOrUpdateConfig,
            });
            return {
              content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
            };
          }
          case "remove": {
            if (!containerId) throw new Error(`containerId is required for ${action} action`);
            await tagmanager.accounts.containers.delete({
              path: `accounts/${accountId}/containers/${containerId}`,
            });
            return {
              content: [{ type: "text", text: JSON.stringify({ success: true, message: `Container ${containerId} deleted` }, null, 2) }],
            };
          }
          case "snippet": {
            if (!containerId) throw new Error(`containerId is required for ${action} action`);
            const response = await tagmanager.accounts.containers.snippet({
              path: `accounts/${accountId}/containers/${containerId}`,
            });
            return {
              content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
            };
          }
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error) {
        return createErrorResponse(`Error performing ${action} on container`, error);
      }
    },
  );
};
