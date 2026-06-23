import { z } from "zod";

export const ContainerVersionSchema = z.object({
  accountId: z.string().optional().describe("GTM Account ID."),
  containerId: z.string().optional().describe("GTM Container ID."),
  containerVersionId: z.string().optional().describe("The Container Version ID."),
  name: z.string().optional().describe("Container version display name."),
  description: z.string().optional().describe("Container version description."),
  deleted: z.boolean().optional().describe("Whether this version has been deleted."),
});
