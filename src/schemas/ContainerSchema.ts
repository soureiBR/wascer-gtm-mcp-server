import { z } from "zod";

export const ContainerSchema = z.object({
  accountId: z.string().describe("GTM Account ID."),
  containerId: z.string().optional().describe("The Container ID."),
  fingerprint: z.string().optional().describe("The fingerprint of the GTM Container."),
  name: z.string().optional().describe("Container display name."),
  domainName: z.array(z.string()).optional().describe("List of domain names."),
  publicId: z.string().optional().describe("Container Public ID."),
  notes: z.string().optional().describe("Container Notes."),
  usageContext: z
    .array(z.enum(["web", "android", "ios", "server", "amp", "usageContextUnspecified"]))
    .optional()
    .describe("List of Usage Contexts for the Container."),
  taggingServerUrls: z.array(z.string()).optional().describe("List of server-side container URLs."),
});
