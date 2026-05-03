from fastapi import APIRouter, Depends
from backend.database import get_db
from backend.auth import get_admin_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_stats(current_user: dict = Depends(get_admin_user)):
    db = get_db()
    
    # Total stats
    total_reqs = await db.logs.count_documents({})
    blocked_reqs = await db.logs.count_documents({"decision": "BLOCK"})
    allowed_reqs = total_reqs - blocked_reqs
    
    # Top blocked domains
    pipeline = [
        {"$match": {"decision": "BLOCK"}},
        {"$group": {"_id": "$url", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_blocked = await db.logs.aggregate(pipeline).to_list(length=5)
    
    # Activity over last 7 days
    activity = []
    for i in range(6, -1, -1):
        date = (datetime.utcnow() - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        next_date = date + timedelta(days=1)
        
        count = await db.logs.count_documents({
            "timestamp": {"$gte": date, "$lt": next_date}
        })
        activity.append({
            "name": date.strftime("%a"),
            "requests": count
        })
        
    # Detailed Reports Data
    # 1. Blocked URL Report
    blocked_cursor = db.logs.find({"decision": "BLOCK"}).sort("timestamp", -1).limit(10)
    blocked_report = await blocked_cursor.to_list(length=10)
    for r in blocked_report: r["_id"] = str(r["_id"])

    # 2. User Activity Report
    user_pipeline = [
        {"$group": {
            "_id": "$username", 
            "total": {"$sum": 1}, 
            "blocked": {"$sum": {"$cond": [{"$eq": ["$decision", "BLOCK"]}, 1, 0]}}
        }},
        {"$sort": {"total": -1}}
    ]
    user_activity = await db.logs.aggregate(user_pipeline).to_list(length=10)

    return {
        "total": total_reqs,
        "blocked": blocked_reqs,
        "allowed": allowed_reqs,
        "top_blocked": top_blocked,
        "activity": activity,
        "reports": {
            "blocked_urls": blocked_report,
            "user_activity": user_activity
        }
    }
