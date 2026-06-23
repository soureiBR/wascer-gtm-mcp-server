import { z } from "zod";
import { ParameterSchema } from "./ParameterSchema";

export const VariableSchema = z.object({
  accountId: z.string().describe("GTM Account ID."),
  containerId: z.string().describe("GTM Container ID."),
  workspaceId: z.string().describe("GTM Workspace ID."),
  variableId: z.string().optional().describe("The Variable ID."),
  fingerprint: z.string().optional().describe("The fingerprint of the GTM Variable."),
  name: z.string().optional().describe("Variable display name."),
  type: z.string().optional().describe("Variable type."),
  parameter: z.array(ParameterSchema).optional().describe("The variable's parameters."),
  notes: z.string().optional().describe("User notes on this variable."),
});
