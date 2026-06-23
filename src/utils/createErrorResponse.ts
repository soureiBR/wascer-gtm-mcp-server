import { log } from "./log";

export function createErrorResponse(context: string, error: unknown) {
  const message =
    error instanceof Error ? error.message : JSON.stringify(error);

  log(`${context}: ${message}`);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            error: true,
            context,
            message,
          },
          null,
          2,
        ),
      },
    ],
  };
}
