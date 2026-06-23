import { z } from "zod";
import { ParameterSchema } from "./ParameterSchema";

export const TagSchema = z.object({
  accountId: z.string().describe("GTM Account ID."),
  containerId: z.string().describe("GTM Container ID."),
  workspaceId: z.string().describe("GTM Workspace ID."),
  tagId: z.string().optional().describe("The Tag ID."),
  fingerprint: z.string().optional().describe("The fingerprint of the GTM Tag."),
  name: z.string().optional().describe("Tag display name."),
  type: z.string().optional().describe("GTM Tag Type."),
  liveOnly: z.boolean().optional().describe("If true, only fires in live environment."),
  notes: z.string().optional().describe("User notes on this tag."),
  parameter: z.array(ParameterSchema).optional().describe("The tag's parameters."),
  firingTriggerId: z.array(z.string()).optional().describe("Firing trigger IDs."),
  blockingTriggerId: z.array(z.string()).optional().describe("Blocking trigger IDs."),
  parentFolderId: z.string().optional().describe("Parent folder id."),
  paused: z.boolean().optional().describe("Whether the tag is paused."),
});
