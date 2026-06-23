import { z } from "zod";
import { ParameterSchema } from "./ParameterSchema";
import { ConditionSchema } from "./ConditionSchema";

export const TriggerSchema = z.object({
  accountId: z.string().describe("GTM Account ID."),
  containerId: z.string().describe("GTM Container ID."),
  workspaceId: z.string().describe("GTM Workspace ID."),
  triggerId: z.string().optional().describe("The Trigger ID."),
  fingerprint: z.string().optional().describe("The fingerprint of the GTM Trigger."),
  name: z.string().optional().describe("Trigger display name."),
  type: z.string().optional().describe("Trigger type."),
  filter: z.array(ConditionSchema).optional().describe("The trigger's filter conditions."),
  autoEventFilter: z.array(ConditionSchema).optional().describe("Auto event filter conditions."),
  customEventFilter: z.array(ConditionSchema).optional().describe("Custom event filter conditions."),
  notes: z.string().optional().describe("User notes on this trigger."),
  parameter: z.array(ParameterSchema).optional().describe("Additional parameters."),
  parentFolderId: z.string().optional().describe("Parent folder id."),
});
