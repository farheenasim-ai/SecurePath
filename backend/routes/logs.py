from fastapi import APIRouter, Depends
from typing import List, Optional
from backend.database import get_db
from backend.auth import get_admin_user
from datetime import datetime

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("/")
async def get_logs(
    limit: int = 50, 
    status: Optional[str] = None, 
    current_user: dict = Depends(get_admin_user)
):
    db = get_db()
    query = {}
    if status:
        query["decision"] = status
        
    cursor = db.logs.find(query).sort("timestamp", -1).limit(limit)
    logs = await cursor.to_list(length=limit)
    for l in logs:
        l["_id"] = str(l["_id"])
    return logs
