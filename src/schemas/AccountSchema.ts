import { z } from "zod";

export const AccountSchema = z.object({
  accountId: z.string().describe("GTM Account ID."),
  fingerprint: z.string().optional().describe("The fingerprint of the GTM Account."),
  name: z.string().optional().describe("Account display name."),
  shareData: z.boolean().optional().describe("Whether the account shares data anonymously."),
});
