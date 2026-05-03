from fastapi import APIRouter, Depends
from typing import List
from backend.database import get_db
from backend.auth import get_admin_user
from backend.models.schemas import AlertResponse

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[AlertResponse])
async def get_alerts(current_user: dict = Depends(get_admin_user)):
    db = get_db()
    cursor = db.alerts.find().sort("timestamp", -1)
    alerts = await cursor.to_list(length=100)
    for a in alerts:
        a["_id"] = str(a["_id"])
    return alerts
