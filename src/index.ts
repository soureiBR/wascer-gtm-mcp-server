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
import { ServiceAccountStore } from "./utils/serviceAccountStore";

const SA_HEADER = "x-gtm-service-account";

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

    // Extract Service Account from header before OAuth processes the request
    const saHeader = request.headers.get(SA_HEADER);
    if (saHeader && (url.pathname === "/mcp" || url.pathname === "/sse")) {
      // Store temporarily — will be associated with userId after auth
      ServiceAccountStore.setPending(requestId, saHeader);
    }

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
        const result = await handleTokenExchangeCallback(options, env);

        // Associate pending SA with the authenticated user
        if (options.props?.userId && saHeader) {
          const sa = saHeader.trim();
          if (sa) {
            try {
              // Validate: try base64 first, then raw JSON
              let credentials: any;
              try {
                credentials = JSON.parse(atob(sa));
              } catch {
                credentials = JSON.parse(sa);
              }

              if (credentials.type === "service_account" && credentials.client_email && credentials.private_key) {
                const b64 = btoa(JSON.stringify(credentials));
                ServiceAccountStore.set(options.props.userId, b64);
                console.log(`[SA] Service Account configured via header for user ${options.props.userId}: ${credentials.client_email}`);
              }
            } catch (e) {
              console.error("[SA] Invalid Service Account in header:", e);
            }
          }
        }

        return result;
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

      ServiceAccountStore.removePending(requestId);
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

      ServiceAccountStore.removePending(requestId);
      throw err;
    }
  },
};
