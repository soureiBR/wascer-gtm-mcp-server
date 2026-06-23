import { z } from "zod";
import { ParameterSchema } from "./ParameterSchema";

export const ClientSchema = z.object({
  accountId: z.string().describe("GTM Account ID."),
  containerId: z.string().describe("GTM Container ID."),
  workspaceId: z.string().describe("GTM Workspace ID."),
  clientId: z.string().optional().describe("The Client ID."),
  fingerprint: z.string().optional().describe("The fingerprint of the GTM Client."),
  name: z.string().optional().describe("Client display name."),
  type: z.string().optional().describe("Client type."),
  parameter: z.array(ParameterSchema).optional().describe("The client's parameters."),
  priority: z.number().optional().describe("Priority determines relative firing order."),
  parentFolderId: z.string().optional().describe("Parent folder id."),
  notes: z.string().optional().describe("User notes on this client."),
});
