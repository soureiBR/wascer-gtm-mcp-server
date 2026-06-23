import { describe, it, expect, vi } from "vitest";
import { createErrorResponse } from "./createErrorResponse";

vi.mock("./log", () => ({
  log: vi.fn(),
}));

describe("createErrorResponse", () => {
  it("formats Error instances correctly", () => {
    const result = createErrorResponse(
      "Test context",
      new Error("Something failed"),
    );
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe(true);
    expect(parsed.context).toBe("Test context");
    expect(parsed.message).toBe("Something failed");
  });

  it("formats string errors correctly", () => {
    const result = createErrorResponse("Test context", "string error");
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.message).toBe('"string error"');
  });

  it("formats object errors correctly", () => {
    const result = createErrorResponse("Test context", { code: 404 });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.message).toBe('{"code":404}');
  });
});
