import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { tagmanager_v2 } from "googleapis";
import { z } from "zod";
import { McpAgentToolParamsModel } from "../models/McpAgentModel";
import { TagSchema } from "../schemas/TagSchema";
import {
  createErrorResponse,
  getTagManagerClient,
  log,
  paginateArray,
} from "../utils";
import Schema$Tag = tagmanager_v2.Schema$Tag;

const PayloadSchema = TagSchema.omit({
  accountId: true,
  containerId: true,
  workspaceId: true,
  tagId: true,
  fingerprint: true,
});

const ITEMS_PER_PAGE = 20;

export const tagActions = (
  server: McpServer,
  { props }: McpAgentToolParamsModel,
): void => {
  server.tool(
    "gtm_tag",
    `Performs GTM tag operations: create, get, list, update, remove, revert. List returns up to ${ITEMS_PER_PAGE} items per page.`,
    {
      action: z
        .enum(["create", "get", "list", "update", "remove", "revert"])
        .describe("The GTM tag operation to perform."),
      accountId: z.string().describe("GTM Account ID."),
      containerId: z.string().describe("GTM Container ID."),
      workspaceId: z.string().describe("GTM Workspace ID."),
      tagId: z.string().optional().describe("GTM Tag ID. Required for get, update, remove, revert."),
      createOrUpdateConfig: PayloadSchema.optional().describe("Config for create/update."),
      fingerprint: z.string().optional().describe("Fingerprint for update/revert."),
      page: z.number().min(1).default(1).describe("Page number."),
      itemsPerPage: z.number().min(1).max(ITEMS_PER_PAGE).default(ITEMS_PER_PAGE).describe("Items per page."),
    },
    async ({ action, accountId, containerId, workspaceId, tagId, createOrUpdateConfig, fingerprint, page, itemsPerPage }) => {
      log(`Running tool: gtm_tag with action ${action}`);

      try {
        const tagmanager = await getTagManagerClient(props);
        const basePath = `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`;

        switch (action) {
          case "create": {
            if (!createOrUpdateConfig) throw new Error(`createOrUpdateConfig is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.tags.create({
              parent: basePath,
              requestBody: createOrUpdateConfig as Schema$Tag,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "get": {
            if (!tagId) throw new Error(`tagId is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.tags.get({
              path: `${basePath}/tags/${tagId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "list": {
            let all: Schema$Tag[] = [];
            let currentPageToken = "";
            do {
              const response = await tagmanager.accounts.containers.workspaces.tags.list({
                parent: basePath,
                pageToken: currentPageToken,
              });
              if (response.data.tag) all = all.concat(response.data.tag);
              currentPageToken = response.data.nextPageToken || "";
            } while (currentPageToken);
            return { content: [{ type: "text", text: JSON.stringify(paginateArray(all, page, itemsPerPage), null, 2) }] };
          }
          case "update": {
            if (!tagId) throw new Error(`tagId is required for ${action}`);
            if (!createOrUpdateConfig) throw new Error(`createOrUpdateConfig is required for ${action}`);
            if (!fingerprint) throw new Error(`fingerprint is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.tags.update({
              path: `${basePath}/tags/${tagId}`,
              fingerprint,
              requestBody: createOrUpdateConfig as Schema$Tag,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "remove": {
            if (!tagId) throw new Error(`tagId is required for ${action}`);
            await tagmanager.accounts.containers.workspaces.tags.delete({
              path: `${basePath}/tags/${tagId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Tag ${tagId} deleted` }, null, 2) }] };
          }
          case "revert": {
            if (!tagId) throw new Error(`tagId is required for ${action}`);
            const response = await tagmanager.accounts.containers.workspaces.tags.revert({
              path: `${basePath}/tags/${tagId}`,
              fingerprint,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error) {
        return createErrorResponse(`Error performing ${action} on GTM tag`, error);
      }
    },
  );
};
