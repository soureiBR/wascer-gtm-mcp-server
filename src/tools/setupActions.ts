import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { McpAgentToolParamsModel } from "../models/McpAgentModel";
import { ServiceAccountStore } from "../utils/serviceAccountStore";
import { createErrorResponse, log } from "../utils";

export const setupActions = (
  server: McpServer,
  { props }: McpAgentToolParamsModel,
): void => {
  server.tool(
    "gtm_setup",
    "Configure your Google Service Account for GTM access. Must be called before using any other GTM tool. Provide the Service Account JSON (base64 encoded or raw JSON).",
    {
      serviceAccountJson: z
        .string()
        .describe(
          "The Google Service Account JSON. Can be base64 encoded or raw JSON string. This SA must have permissions on the GTM accounts you want to manage.",
        ),
    },
    async ({ serviceAccountJson }) => {
      log(`Running tool: gtm_setup for user ${props.email}`);

      try {
        let credentials: any;

        // Try base64 first, then raw JSON
        try {
          credentials = JSON.parse(atob(serviceAccountJson));
        } catch {
          try {
            credentials = JSON.parse(serviceAccountJson);
          } catch {
            throw new Error(
              "Invalid Service Account JSON. Provide a valid JSON string or base64-encoded JSON.",
            );
          }
        }

        // Validate required fields
        if (credentials.type !== "service_account") {
          throw new Error(
            `Invalid credentials type: "${credentials.type}". Expected "service_account".`,
          );
        }

        if (!credentials.client_email) {
          throw new Error("Missing 'client_email' in Service Account JSON.");
        }

        if (!credentials.private_key) {
          throw new Error("Missing 'private_key' in Service Account JSON.");
        }

        // Store as base64
        const b64 = btoa(JSON.stringify(credentials));
        ServiceAccountStore.set(props.userId, b64);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: "Service Account configured successfully.",
                  serviceAccountEmail: credentials.client_email,
                  projectId: credentials.project_id,
                  hint: "You can now use all GTM tools. This SA has access only to GTM accounts where it has been granted permissions.",
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return createErrorResponse("Error configuring Service Account", error);
      }
    },
  );
};
