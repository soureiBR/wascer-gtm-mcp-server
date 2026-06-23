import { accountActions } from "./accountActions";
import { builtInVariableActions } from "./builtInVariableActions";
import { clientActions } from "./clientActions";
import { containerActions } from "./containerActions";
import { setupActions } from "./setupActions";
import { tagActions } from "./tagActions";
import { triggerActions } from "./triggerActions";
import { variableActions } from "./variableActions";
import { versionActions } from "./versionActions";
import { workspaceActions } from "./workspaceActions";
import { removeMCPServerData } from "./removeMCPServerData";

export const tools = [
  setupActions,
  accountActions,
  builtInVariableActions,
  clientActions,
  containerActions,
  workspaceActions,
  tagActions,
  triggerActions,
  variableActions,
  versionActions,
  removeMCPServerData,
];
