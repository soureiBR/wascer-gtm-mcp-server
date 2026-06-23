// Shim for the "ai" module required by agents/mcp at build time.
// The jsonSchema import is only used for AI SDK tool conversion which we don't need.
export function jsonSchema() {
  throw new Error("ai module is not available");
}
