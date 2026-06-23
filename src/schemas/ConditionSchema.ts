import { z } from "zod";
import { ParameterSchema } from "./ParameterSchema";

export const ConditionSchema = z.object({
  type: z.string().optional().describe("The type of operator for this condition."),
  parameter: z.array(ParameterSchema).optional().describe("A list of named parameters."),
});
