# Wascer GTM MCP Server

MCP server que permite assistentes de IA (Claude, Cursor, etc.) gerenciarem o Google Tag Manager via linguagem natural.

## Como conectar

### Claude Desktop

Settings → Developer → Edit Config:

```json
{
  "mcpServers": {
    "wascer-gtm": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://gtm-mcp.wascer.com/mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add wascer-gtm -- npx mcp-remote https://gtm-mcp.wascer.com/mcp
```

### Cursor / VS Code

Adicione nas configuracoes de MCP:

```json
{
  "mcpServers": {
    "wascer-gtm": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://gtm-mcp.wascer.com/mcp"]
    }
  }
}
```

Ao conectar, o navegador abre para login com Google. Apos autenticar, as tools ficam disponiveis.

## O que da pra fazer

Com linguagem natural, voce pode pedir ao AI para:

- Listar contas e containers GTM
- Criar containers web e server-side
- Criar e editar tags, triggers e variaveis
- Ativar built-in variables (Page URL, Event, Click ID, etc.)
- Criar clients server-side (GA4 client, etc.)
- Criar versoes e publicar

### Exemplo de uso

```
Na minha conta GTM, crie um container web chamado "meu-site" com:
- Variavel GA4 ID com valor G-XXXXXXXX
- Trigger All Pages
- Tag GA4 Configuration apontando para o server
- Publique
```

A IA executa todas as operacoes automaticamente via Google Tag Manager API.

## Tools disponiveis

| Tool | Operacoes | Descricao |
|------|-----------|-----------|
| `gtm_account` | get, list, update | Gerenciar contas GTM |
| `gtm_container` | create, get, list, update, remove, snippet | Gerenciar containers (web e server) |
| `gtm_workspace` | create, get, list, update, remove, createVersion, getStatus, sync | Gerenciar workspaces e criar versoes |
| `gtm_tag` | create, get, list, update, remove, revert | Gerenciar tags |
| `gtm_trigger` | create, get, list, update, remove, revert | Gerenciar triggers |
| `gtm_variable` | create, get, list, update, remove, revert | Gerenciar variaveis |
| `gtm_version` | get, live, publish, remove, setLatest, undelete, update | Gerenciar e publicar versoes |
| `gtm_built_in_variable` | create, list, remove, revert | Ativar/desativar variaveis nativas |
| `gtm_client` | create, get, list, update, remove, revert | Gerenciar clients server-side |
| `gtm_setup` | configure | Configurar Service Account (opcional) |

## Autenticacao

### Google OAuth (padrao)

Ao conectar, voce faz login com sua conta Google. O MCP acessa as contas GTM que sua conta tem permissao. Nao precisa de configuracao adicional.

### Service Account (opcional)

Para acesso a nivel de plataforma (ex: gerenciar contas de clientes), envie um Service Account JSON no chat:

```
Configure o acesso GTM com este Service Account:

ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIs...
```

A IA chama `gtm_setup` automaticamente. A partir dai, todas as operacoes usam o Service Account.

## Troubleshooting

**Resetar autenticacao**

```bash
rm -rf ~/.mcp-auth
```

Reinicie o MCP client para relogar.

**"Access blocked" no login Google**

Verifique se sua conta Google tem acesso ao Tag Manager e se o app OAuth tem os scopes GTM habilitados.

**Tools nao aparecem**

Use um nome curto para o server (ex: `wascer-gtm`). Alguns clients tem limite de 60 caracteres para nome + tool.

## License

Apache-2.0
