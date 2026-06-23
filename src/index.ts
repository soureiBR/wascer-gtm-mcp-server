import { OAuthProvider } from "@cloudflare/workers-oauth-provider";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { McpAgentPropsModel } from "./models/McpAgentModel";
import { tools } from "./tools";
import {
  apisHandler,
  getPackageVersion,
  handleTokenExchangeCallback,
} from "./utils";

export class WascerGTMMCPServer extends McpAgent<
  Env,
  null,
  McpAgentPropsModel
> {
  server = new McpServer({
    name: "wascer-gtm-mcp-server",
    version: getPackageVersion(),
    description: "Wascer GTM MCP Server",
  });

  async init() {
    console.log("[MCP] init() called");

    tools.forEach((register) => {
      // @ts-ignore
      register(this.server, { props: this.props, env: this.env });
    });
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: any) {
    const startedAt = Date.now();
    const url = new URL(request.url);
    const requestId = crypto.randomUUID();

    console.log("[HTTP] Incoming request", {
      requestId,
      method: request.method,
      path: url.pathname,
    });

    const provider = new OAuthProvider({
      apiRoute: ["/sse", "/mcp"],
      apiHandlers: {
        "/sse": WascerGTMMCPServer.serveSSE("/sse"),
        "/mcp": WascerGTMMCPServer.serve("/mcp"),
      },
      // @ts-ignore
      defaultHandler: apisHandler,
      authorizeEndpoint: "/authorize",
      tokenEndpoint: "/token",
      clientRegistrationEndpoint: "/register",
      tokenExchangeCallback: async (options) => {
        return handleTokenExchangeCallback(options, env);
      },
    });

    try {
      const response = await provider.fetch(request, env, ctx);

      console.log("[HTTP] Response", {
        requestId,
        durationMs: Date.now() - startedAt,
        status: response.status,
        path: url.pathname,
      });

      return response;
    } catch (err) {
      console.error("[HTTP] Unhandled exception", {
        requestId,
        path: url.pathname,
        error:
          err instanceof Error
            ? { name: err.name, message: err.message, stack: err.stack }
            : err,
      });

      throw err;
    }
  },
};
