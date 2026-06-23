import { z } from "zod";

export const WorkspaceSchema = z.object({
  accountId: z.string().describe("GTM Account ID."),
  containerId: z.string().describe("GTM Container ID."),
  workspaceId: z.string().optional().describe("The Workspace ID."),
  fingerprint: z.string().optional().describe("The fingerprint of the GTM Workspace."),
  name: z.string().optional().describe("Workspace display name."),
  description: z.string().optional().describe("Workspace description."),
});
