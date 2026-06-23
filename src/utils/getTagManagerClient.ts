import { google } from "googleapis";
import { log } from "./log";
import { ServiceAccountStore } from "./serviceAccountStore";
import type { McpAgentPropsModel } from "../models/McpAgentModel";

type TagManagerClient = ReturnType<typeof google.tagmanager>;

export async function getTagManagerClient(
  props: McpAgentPropsModel,
): Promise<TagManagerClient> {
  // Mode 1: Service Account (if configured via gtm_setup)
  const serviceAccountB64 = ServiceAccountStore.get(props.userId);
  if (serviceAccountB64) {
    return createClientFromServiceAccount(serviceAccountB64);
  }

  // Mode 2: User OAuth token (default)
  if (!props.accessToken) {
    throw new Error(
      "No GTM access available. Either login with a Google account that has GTM access, or use gtm_setup to configure a Service Account.",
    );
  }

  if (props.expiresAt) {
    const now = Math.floor(Date.now() / 1000);
    if (now >= props.expiresAt) {
      throw new Error(
        "Access token expired. Please refresh your connection or re-authenticate.",
      );
    }
  }

  try {
    return google.tagmanager({
      version: "v2",
      headers: {
        Authorization: `Bearer ${props.accessToken}`,
      },
    });
  } catch (error) {
    log("Error creating Tag Manager client with OAuth token:", error);
    throw error;
  }
}

function createClientFromServiceAccount(b64: string): TagManagerClient {
  try {
    const credentials = JSON.parse(atob(b64));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        "https://www.googleapis.com/auth/tagmanager.edit.containers",
        "https://www.googleapis.com/auth/tagmanager.edit.containerversions",
        "https://www.googleapis.com/auth/tagmanager.publish",
        "https://www.googleapis.com/auth/tagmanager.manage.users",
        "https://www.googleapis.com/auth/tagmanager.delete.containers",
        "https://www.googleapis.com/auth/tagmanager.manage.accounts",
        "https://www.googleapis.com/auth/tagmanager.readonly",
      ],
    });

    return google.tagmanager({
      version: "v2",
      auth,
    });
  } catch (error) {
    log("Error creating Tag Manager client with Service Account:", error);
    throw error;
  }
}
