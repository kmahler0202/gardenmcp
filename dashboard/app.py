import time
import os
import json
import pandas as pd
import plotly.express as px
import streamlit as st
import sys

# Support both Docker (shared/ is a sibling of app.py) and local dev (shared/ is at project root)
_here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _here)
sys.path.insert(0, os.path.join(_here, ".."))
from shared.redis_client import get_state, set_state, get_client

POLL_INTERVAL = int(os.environ.get("POLL_INTERVAL", 2))

st.set_page_config(
    page_title="My Hub",
    layout="wide",
    page_icon="🌱"
)

# Startup check
try:
    get_client()
except RuntimeError as e:
    st.error(f"Cannot connect to Redis: {e}")
    st.stop()

# Load state
state = get_state()
page = state.get("page", {})
tabs = page.get("tabs", [])
sections = state.get("sections", [])
notifications = state.get("notifications", [])

# Hide Streamlit chrome
st.markdown("""
<style>
    #MainMenu, footer, header { visibility: hidden; }
    .block-container { padding-top: 1.5rem !important; }
</style>
""", unsafe_allow_html=True)

# Render notifications
for n in notifications:
    getattr(st, n["level"])(n["message"])

# Header
_left, _right = st.columns([4, 1])
_left.markdown(f"## 🌱 &nbsp;{page.get('title', 'My Hub')}")
if state.get("last_updated"):
    try:
        from datetime import datetime
        _dt = datetime.fromisoformat(state["last_updated"]).astimezone()
        _label = _dt.strftime("%b %d · %I:%M %p").lstrip("0").replace(" 0", " ")
    except Exception:
        _label = state["last_updated"][:16]
    _right.markdown(
        f"<div style='text-align:right;padding-top:1rem;color:#999;font-size:0.8rem;'>↻ {_label}</div>",
        unsafe_allow_html=True,
    )
st.divider()

# Sort sections
sorted_sections = sorted(sections, key=lambda s: (s.get("order") is None, s.get("order", 0)))


def render_todos(section: dict, state: dict):
    if section.get("title"):
        st.subheader(section["title"])
    items = section["data"].get("items", [])
    priority_order = {"high": 0, "normal": 1, "low": 2}
    sorted_items = sorted(
        items,
        key=lambda x: (x.get("done", False), priority_order.get(x.get("priority", "normal"), 1))
    )
    state_changed = False
    for item in sorted_items:
        col1, col2 = st.columns([0.05, 0.95])
        with col1:
            checked = st.checkbox(
                label="",
                value=item.get("done", False),
                key=f"todo_{section['id']}_{item['id']}",
                label_visibility="collapsed"
            )
        with col2:
            prefix = "🔴 " if item.get("priority") == "high" and not item.get("done") else ""
            text = item["text"]
            if item.get("done"):
                st.markdown(f"~~{text}~~")
            else:
                st.markdown(f"{prefix}**{text}**" if item.get("priority") == "high" else text)
            meta = []
            if item.get("due_date"):
                meta.append(f"📅 {item['due_date']}")
            if item.get("source"):
                meta.append(f"*{item['source']}*")
            if meta:
                st.caption(" · ".join(meta))
        if checked != item.get("done", False):
            item["done"] = checked
            state_changed = True
    if state_changed:
        set_state(state)
        st.rerun()


def render_metrics(section: dict):
    if section.get("title"):
        st.subheader(section["title"])
    items = section["data"].get("items", [])
    if not items:
        return
    cols = st.columns(len(items))
    for col, m in zip(cols, items):
        col.metric(label=m["label"], value=m["value"], delta=m.get("delta"))


def render_chart(section: dict):
    if section.get("title"):
        st.subheader(section["title"])
    d = section["data"]
    chart_type = d.get("chart_type", "bar")
    x = d.get("x_data", [])
    y = d.get("y_data", [])
    color_seq = [d["color"]] if d.get("color") else None
    labels = {"x": d.get("x_label", ""), "y": d.get("y_label", "")}
    try:
        if chart_type == "bar":
            fig = px.bar(x=x, y=y, labels=labels, color_discrete_sequence=color_seq)
        elif chart_type == "line":
            fig = px.line(x=x, y=y, labels=labels, color_discrete_sequence=color_seq)
        elif chart_type == "area":
            fig = px.area(x=x, y=y, labels=labels, color_discrete_sequence=color_seq)
        elif chart_type == "scatter":
            fig = px.scatter(x=x, y=y, labels=labels, color_discrete_sequence=color_seq)
        elif chart_type == "pie":
            fig = px.pie(names=x, values=y, color_discrete_sequence=color_seq)
        else:
            st.warning(f"Unknown chart type: {chart_type}")
            return
        fig.update_layout(margin=dict(t=40, b=20, l=20, r=20))
        st.plotly_chart(fig, use_container_width=True)
    except Exception as e:
        st.warning(f"Could not render chart: {e}")


def render_markdown(section: dict):
    if section.get("title"):
        st.subheader(section["title"])
    st.markdown(section["data"].get("content", ""))


def render_table(section: dict):
    if section.get("title"):
        st.subheader(section["title"])
    rows = section["data"].get("rows", [])
    if rows:
        df = pd.DataFrame(rows)
        st.dataframe(df, hide_index=section["data"].get("hide_index", True), use_container_width=True)


def render_text(section: dict):
    st.write(section["data"].get("content", ""))


def render_badge_row(section: dict):
    if section.get("title"):
        st.subheader(section["title"])
    items = section["data"].get("items", [])
    cols = st.columns(len(items)) if items else []
    for col, item in zip(cols, items):
        col.badge(item["label"], color=item.get("color", "blue"))


def render_section(section: dict, state: dict):
    t = section.get("type")
    if t == "todos":
        render_todos(section, state)
    elif t == "metrics":
        render_metrics(section)
    elif t == "chart":
        render_chart(section)
    elif t == "markdown":
        render_markdown(section)
    elif t == "table":
        render_table(section)
    elif t == "text":
        render_text(section)
    elif t == "badge_row":
        render_badge_row(section)
    else:
        st.warning(f"Unknown section type: '{t}' (id: {section.get('id')})")


# Tab routing
above_tabs = [s for s in sorted_sections if not s.get("tab") or s["tab"] not in tabs]
tabbed = {tab: [s for s in sorted_sections if s.get("tab") == tab] for tab in tabs}

for section in above_tabs:
    render_section(section, state)

if tabs:
    tab_objects = st.tabs(tabs)
    for tab_name, tab_obj in zip(tabs, tab_objects):
        with tab_obj:
            for section in tabbed[tab_name]:
                render_section(section, state)

# Empty state
if not sections and not notifications:
    st.info("🌱 Your garden is empty. Ask Claude to add something.")

# Poll loop
time.sleep(POLL_INTERVAL)
st.rerun()
