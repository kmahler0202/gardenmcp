import os
import json
import redis
from datetime import datetime, timezone
from copy import deepcopy

REDIS_KEY = "garden:state"

EMPTY_STATE = {
    "page": {"title": "My Hub", "layout": "wide", "tabs": []},
    "sections": [],
    "notifications": [],
    "last_updated": None
}

def get_client() -> redis.Redis:
    """Connect to Redis. Raises RuntimeError with a clear message if unreachable."""
    host = os.environ.get("REDIS_HOST", "localhost")
    port = int(os.environ.get("REDIS_PORT", 6379))
    password = os.environ.get("REDIS_PASSWORD") or None
    client = redis.Redis(host=host, port=port, password=password, decode_responses=True)
    try:
        client.ping()
    except redis.ConnectionError as e:
        raise RuntimeError(f"Cannot connect to Redis at {host}:{port} — {e}")
    return client

def get_state() -> dict:
    """Read and deserialize state from Redis. Returns empty scaffold if key missing."""
    client = get_client()
    raw = client.get(REDIS_KEY)
    if raw is None:
        return deepcopy(EMPTY_STATE)
    return json.loads(raw)

def set_state(state: dict) -> None:
    """Serialize and write state to Redis atomically."""
    state["last_updated"] = datetime.now(timezone.utc).isoformat()
    client = get_client()
    client.set(REDIS_KEY, json.dumps(state))
