# Garden

A personal dashboard hub. Claude controls a live React dashboard via an MCP server and Redis — the surface starts blank, Claude decides what goes on it.

## Architecture

```
Claude Desktop → MCP Server (stdio) → Redis → Gateway (SSE) → React (localhost:3000)
```

State changes made by Claude propagate to the browser in under a second via Server-Sent Events. No polling.

## Services

| Service | Port | Description |
|---------|------|-------------|
| Redis | 6379 | Shared state store |
| Gateway | 8080 | REST + SSE bridge (`GET /state`, `POST /state`, `GET /stream`) |
| garden-ui | 3000 | React dashboard |
| MCP Server | stdio | Claude Desktop plugin — not in Docker |

## Quick Start

```bash
# Start Redis, gateway, and the React dashboard
docker-compose up -d redis gateway garden-ui

# Open in browser
# http://localhost:3000
```

Then talk to Claude in Claude Desktop. It populates the dashboard in real time.

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

Claude places sections by calling `set_section(section_id, type, data, ...)`.

| Type | Description | Key data fields |
|------|-------------|-----------------|
| `todos` | Todo list with checkboxes | `items: [{id, text, done, priority, due_date?, source?}]`, `next_id` |
| `markdown` | Rendered markdown | `content: string` |
| `metrics` | Row of metric cards | `items: [{label, value, delta?}]` |
| `chart` | Bar/line/area/pie chart | `chart_type`, `x_data`, `y_data`, `color?`, `x_label?`, `y_label?` |
| `table` | Data table | `rows: [{col: value}]`, `hide_index?` |
| `text` | Plain text block | `content: string` |
| `badge_row` | Row of colored badges | `items: [{label, color?}]` |
| `feed` | Item feed (stub) | `items: [{title?, description?, url?}]` |

## Component Catalog

The React app renders from a fixed catalog — Claude composes from named components, never generates raw HTML.

**Layout primitives** (building blocks): `Stack`, `Row`, `Grid`, `Card`, `Split`

**Content components**: `TodoList`, `MarkdownBlock`, `MetricRow`, `ChartBlock`, `DataTable`, `TextBlock`, `BadgeRow`, `FeedItem`

Unknown section types render a muted placeholder — no crash.

## Tabs

Sections with a `tab` value matching a tab in `page.tabs` are routed into that tab. Sections without a `tab`, or with an unrecognized tab name, render above the tab bar.

## Dev Workflow

Both services support hot reload:
- **gateway**: uvicorn `--reload` watches `gateway/` and `shared/` (volume-mounted)
- **garden-ui**: Vite HMR watches `src/` (volume-mounted)

Editing `shared/redis_client.py` restarts the gateway automatically.

## Data Flow on User Interaction (e.g. todo checkbox)

1. User checks a checkbox
2. React updates local state optimistically
3. React `POST /api/state` with the updated full state
4. Gateway calls `set_state()` → writes to Redis → publishes to `garden:updates`
5. All connected SSE clients (including this tab) receive the update
