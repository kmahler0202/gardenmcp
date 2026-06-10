# Garden MCP

A personal dashboard hub. Claude controls a live Streamlit page via an MCP server and Redis shared state. The surface starts blank — Claude decides what goes on it.

## Architecture

```
Claude (Claude Desktop) → MCP Server (stdio) → Redis → Streamlit (localhost:8501)
```

## Startup

```bash
# Start Redis + Streamlit dashboard
docker-compose up -d

# Open in browser
# http://localhost:8501
```

Then talk to Claude. It will populate the dashboard in real time.

## Claude Desktop Config

Add to `claude_desktop_config.json` (adjust the path):

```json
{
  "mcpServers": {
    "garden": {
      "command": "python",
      "args": ["C:/absolute/path/to/garden/mcp_server/server.py"],
      "env": {
        "REDIS_HOST": "localhost",
        "REDIS_PORT": "6379"
      }
    }
  }
}
```

Install MCP server dependencies once:

```bash
pip install -r mcp_server/requirements.txt
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `get_state` | Read full dashboard state |
| `set_page_config` | Update title, layout, tabs |
| `set_section` | Create or replace a section |
| `update_section` | Shallow-merge into a section's data |
| `remove_section` | Delete a section |
| `reorder_sections` | Change section order |
| `add_notification` | Show a banner notification |
| `clear_notifications` | Remove all notifications |
| `clear_dashboard` | Reset to blank canvas |

## Section Types

`todos`, `metrics`, `chart`, `bar/line/area/scatter/pie`, `markdown`, `table`, `text`, `badge_row`

## Known Limitations

- **Layout changes** (`set_page_config layout=...`) take effect on the next full browser page reload — this is a Streamlit constraint. Refresh the tab after changing layout.
- Dashboard polls Redis every 2 seconds (configurable via `POLL_INTERVAL`).
