import json
import os
import sys
import uuid
from datetime import datetime, timezone
from typing import Optional

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from shared.redis_client import get_state as _get_state, set_state as _set_state

from fastmcp import FastMCP

mcp = FastMCP("garden")


@mcp.tool()
def set_page_config(
    title: Optional[str] = None,
    layout: Optional[str] = None,
    tabs: Optional[list] = None,
) -> str:
    """Update page-level settings. Only provided fields are changed; omitted fields are left as-is."""
    state = _get_state()
    page = state.setdefault("page", {})
    if title is not None:
        page["title"] = title
    if layout is not None:
        page["layout"] = layout
    if tabs is not None:
        page["tabs"] = tabs
    _set_state(state)
    parts = []
    if title is not None:
        parts.append(f"title='{title}'")
    if layout is not None:
        parts.append(f"layout='{layout}'")
    if tabs is not None:
        parts.append(f"tabs={tabs}")
    return f"Page config updated: {', '.join(parts) or '(nothing changed)'}"


@mcp.tool()
def set_section(
    section_id: str,
    type: str,
    data: dict,
    title: Optional[str] = None,
    tab: Optional[str] = None,
    order: Optional[int] = None,
) -> str:
    """Create a new section or completely replace an existing one by section_id."""
    state = _get_state()
    sections = state.setdefault("sections", [])
    new_section = {
        "id": section_id,
        "type": type,
        "title": title,
        "tab": tab,
        "order": order,
        "data": data,
    }
    existing_idx = next((i for i, s in enumerate(sections) if s["id"] == section_id), None)
    if existing_idx is not None:
        if order is None:
            new_section["order"] = sections[existing_idx].get("order")
        sections[existing_idx] = new_section
        action = "replaced"
    else:
        if order is not None:
            sections.insert(order, new_section)
        else:
            sections.append(new_section)
        action = "created"
    _set_state(state)
    return f"Section '{section_id}' {action} (type: {type})"


@mcp.tool()
def update_section(section_id: str, data: dict) -> str:
    """Shallow-merge data into an existing section's data field without replacing the whole section."""
    state = _get_state()
    sections = state.get("sections", [])
    for section in sections:
        if section["id"] == section_id:
            section.setdefault("data", {}).update(data)
            _set_state(state)
            return f"Section '{section_id}' updated with keys: {list(data.keys())}"
    return f"Error: section '{section_id}' not found"


@mcp.tool()
def remove_section(section_id: str) -> str:
    """Remove a section by id."""
    state = _get_state()
    sections = state.get("sections", [])
    new_sections = [s for s in sections if s["id"] != section_id]
    if len(new_sections) == len(sections):
        return f"Section '{section_id}' not found — no change made"
    state["sections"] = new_sections
    _set_state(state)
    return f"Section '{section_id}' removed"


@mcp.tool()
def reorder_sections(section_ids: list) -> str:
    """Reorder sections to match the given list. Unlisted sections retain their relative order after."""
    state = _get_state()
    sections = state.get("sections", [])
    id_to_section = {s["id"]: s for s in sections}
    for sid in section_ids:
        if sid not in id_to_section:
            return f"Error: section '{sid}' not found"
    listed = [id_to_section[sid] for sid in section_ids]
    unlisted = [s for s in sections if s["id"] not in set(section_ids)]
    reordered = listed + unlisted
    for i, s in enumerate(reordered):
        s["order"] = i
    state["sections"] = reordered
    _set_state(state)
    return f"Sections reordered: {section_ids}"


@mcp.tool()
def add_notification(message: str, level: str = "info") -> str:
    """Append a notification (info/warning/error/success). Only the 5 most recent are kept."""
    state = _get_state()
    notifications = state.setdefault("notifications", [])
    notifications.append({
        "id": str(uuid.uuid4()),
        "message": message,
        "level": level,
        "ts": datetime.now(timezone.utc).isoformat(),
    })
    state["notifications"] = notifications[-5:]
    _set_state(state)
    return f"Notification added ({level}): {message}"


@mcp.tool()
def clear_notifications() -> str:
    """Empty the notifications list."""
    state = _get_state()
    state["notifications"] = []
    _set_state(state)
    return "All notifications cleared"


@mcp.tool()
def get_state() -> str:
    """Return the full current dashboard state as formatted JSON."""
    state = _get_state()
    return json.dumps(state, indent=2)


@mcp.tool()
def clear_dashboard() -> str:
    """Reset sections and notifications to empty while preserving page config."""
    state = _get_state()
    state["sections"] = []
    state["notifications"] = []
    state["last_updated"] = None
    _set_state(state)
    return "Dashboard cleared — sections and notifications reset, page config preserved"


if __name__ == "__main__":
    mcp.run()
