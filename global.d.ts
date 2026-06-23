declare module "agents/mcp" {
  import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
  import { DurableObject } from "cloudflare:workers";

  export class McpAgent<E, S, P> extends DurableObject {
    server: McpServer;
    props: P;
    env: E;

    init(): Promise<void>;

    static serve(path: string): any;
    static serveSSE(path: string): any;
  }
}
