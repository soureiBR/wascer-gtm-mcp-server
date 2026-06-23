import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { tagmanager_v2 } from "googleapis";
import { z } from "zod";
import { McpAgentToolParamsModel } from "../models/McpAgentModel";
import { ContainerVersionSchema } from "../schemas/ContainerVersionSchema";
import {
  createErrorResponse,
  getTagManagerClient,
  log,
} from "../utils";
import Schema$ContainerVersion = tagmanager_v2.Schema$ContainerVersion;

const PayloadSchema = ContainerVersionSchema.omit({
  accountId: true,
  containerId: true,
  containerVersionId: true,
});

export const versionActions = (
  server: McpServer,
  { props }: McpAgentToolParamsModel,
): void => {
  server.tool(
    "gtm_version",
    "Performs container version operations: get, live, publish, remove, setLatest, undelete, update.",
    {
      action: z
        .enum(["get", "live", "publish", "remove", "setLatest", "undelete", "update"])
        .describe("The container version operation to perform."),
      accountId: z.string().describe("GTM Account ID."),
      containerId: z.string().describe("GTM Container ID."),
      containerVersionId: z
        .string()
        .optional()
        .describe("GTM Container Version ID. Required for all except 'live'."),
      createOrUpdateConfig: PayloadSchema.optional().describe("Config for 'update' action."),
      fingerprint: z.string().optional().describe("Fingerprint for 'publish' and 'update'."),
    },
    async ({ action, accountId, containerId, containerVersionId, createOrUpdateConfig, fingerprint }) => {
      log(`Running tool: gtm_version with action ${action}`);

      try {
        const tagmanager = await getTagManagerClient(props);
        const basePath = `accounts/${accountId}/containers/${containerId}`;

        switch (action) {
          case "get": {
            if (!containerVersionId) throw new Error(`containerVersionId is required for ${action}`);
            const response = await tagmanager.accounts.containers.versions.get({
              path: `${basePath}/versions/${containerVersionId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "live": {
            const response = await tagmanager.accounts.containers.versions.live({
              parent: basePath,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "publish": {
            if (!containerVersionId) throw new Error(`containerVersionId is required for ${action}`);
            const response = await tagmanager.accounts.containers.versions.publish({
              path: `${basePath}/versions/${containerVersionId}`,
              fingerprint,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "remove": {
            if (!containerVersionId) throw new Error(`containerVersionId is required for ${action}`);
            await tagmanager.accounts.containers.versions.delete({
              path: `${basePath}/versions/${containerVersionId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Version ${containerVersionId} deleted` }, null, 2) }] };
          }
          case "setLatest": {
            if (!containerVersionId) throw new Error(`containerVersionId is required for ${action}`);
            const response = await tagmanager.accounts.containers.versions.set_latest({
              path: `${basePath}/versions/${containerVersionId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "undelete": {
            if (!containerVersionId) throw new Error(`containerVersionId is required for ${action}`);
            const response = await tagmanager.accounts.containers.versions.undelete({
              path: `${basePath}/versions/${containerVersionId}`,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          case "update": {
            if (!containerVersionId) throw new Error(`containerVersionId is required for ${action}`);
            if (!createOrUpdateConfig) throw new Error(`createOrUpdateConfig is required for ${action}`);
            if (!fingerprint) throw new Error(`fingerprint is required for ${action}`);
            const response = await tagmanager.accounts.containers.versions.update({
              path: `${basePath}/versions/${containerVersionId}`,
              fingerprint,
              requestBody: createOrUpdateConfig as Schema$ContainerVersion,
            });
            return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
          }
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error) {
        return createErrorResponse(`Error performing ${action} on container version`, error);
      }
    },
  );
};
