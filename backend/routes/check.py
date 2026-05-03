from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from backend.database import get_db
from backend.auth import get_current_user
from backend.models.schemas import URLCheckRequest, URLCheckResponse, AccessLog
from backend.services.policy_engine import policy_engine

router = APIRouter(prefix="/check", tags=["check"])

@router.post("-url", response_model=URLCheckResponse)
async def check_url(payload: URLCheckRequest, current_user: dict = Depends(get_current_user)):
    # 1. Evaluate via Simulated Interception Layer
    result = await policy_engine.intercept_request(payload.url, current_user["role"])
    
    # 2. Log the decision
    db = get_db()
    log_entry = {
        "username": current_user["username"],
        "url": payload.url,
        "decision": result["status"],
        "reason": result["reason"],
        "timestamp": datetime.utcnow(),
        "role": current_user["role"],
        "category": result["category"]
    }
    await db.logs.insert_one(log_entry)

    # 3. Alert Module: Track repeated violations
    if result["status"] == "BLOCK":
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        violations_count = await db.logs.count_documents({
            "username": current_user["username"],
            "decision": "BLOCK",
            "timestamp": {"$gte": one_hour_ago}
        })
        
        if violations_count >= 3:
            # Create or update alert
            await db.alerts.update_one(
                {"username": current_user["username"]},
                {
                    "$set": {
                        "violations_count": violations_count,
                        "last_violation_url": payload.url,
                        "timestamp": datetime.utcnow()
                    }
                },
                upsert=True
            )
    
    return result
