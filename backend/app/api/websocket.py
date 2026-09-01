"""
WebSocket Streaming Manager for Real-Time Convective Nowcast Updates.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import asyncio
import json
import logging

from ..services.nowcast_service import nowcast_service

logger = logging.getLogger(__name__)
ws_router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.client_locations: Dict[WebSocket, Dict[str, float]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.client_locations:
            del self.client_locations[websocket]
        logger.info(f"WebSocket client disconnected. Total active: {len(self.active_connections)}")

    def set_location(self, websocket: WebSocket, lat: float, lon: float):
        self.client_locations[websocket] = {"lat": lat, "lon": lon}

    async def send_json(self, websocket: WebSocket, data: Dict[str, Any]):
        await websocket.send_text(json.dumps(data))

manager = ConnectionManager()

@ws_router.websocket("/ws/nowcast")
async def websocket_nowcast_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive client ping or updated location
            data_text = await websocket.receive_text()
            try:
                msg = json.loads(data_text)
                msg_type = msg.get("type", "ping")

                if msg_type == "subscribe_location":
                    lat = float(msg["latitude"])
                    lon = float(msg["longitude"])
                    manager.set_location(websocket, lat, lon)

                    # Immediately generate and return initial nowcast
                    nowcast = await nowcast_service.generate_nowcast(lat=lat, lon=lon)
                    await manager.send_json(websocket, {
                        "type": "nowcast_update",
                        "data": nowcast.model_dump(),
                    })

                elif msg_type == "refresh":
                    loc = manager.client_locations.get(websocket)
                    if loc:
                        nowcast = await nowcast_service.generate_nowcast(lat=loc["lat"], lon=loc["lon"])
                        await manager.send_json(websocket, {
                            "type": "nowcast_update",
                            "data": nowcast.model_dump(),
                        })

                elif msg_type == "ping":
                    await manager.send_json(websocket, {"type": "pong"})

            except Exception as e:
                logger.error(f"Error handling WS message: {e}")
                await manager.send_json(websocket, {"type": "error", "message": str(e)})

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket unhandled error: {e}")
        manager.disconnect(websocket)
