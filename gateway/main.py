import sys
import os
from typing import AsyncGenerator

import redis.asyncio as aioredis
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from shared.redis_client import get_state, set_state

REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD") or None
PUBSUB_CHANNEL = "garden:updates"

app = FastAPI(title="Garden Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/state")
def read_state():
    return get_state()


@app.post("/state")
async def write_state(request: Request):
    body = await request.json()
    set_state(body)
    return {"ok": True}


@app.get("/stream")
async def stream(request: Request):
    async def event_generator() -> AsyncGenerator:
        r = aioredis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            password=REDIS_PASSWORD,
            decode_responses=True,
        )
        pubsub = r.pubsub()
        await pubsub.subscribe(PUBSUB_CHANNEL)
        try:
            async for message in pubsub.listen():
                if await request.is_disconnected():
                    break
                if message["type"] == "message":
                    yield {"data": message["data"]}
        finally:
            await pubsub.unsubscribe(PUBSUB_CHANNEL)
            await r.aclose()

    return EventSourceResponse(event_generator(), ping=15)
