from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId
from backend.database import get_db
from backend.auth import get_admin_user
from backend.models.schemas import PolicyCreate, PolicyResponse, CategoryResponse, CategoryBase
from backend.services.policy_engine import policy_engine

router = APIRouter(prefix="/policies", tags=["policies"])

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(current_user: dict = Depends(get_admin_user)):
    db = get_db()
    cursor = db.categories.find()
    categories = await cursor.to_list(length=100)
    for c in categories:
        c["_id"] = str(c["_id"])
    return categories

@router.put("/categories/{name}")
async def toggle_category(name: str, payload: dict, current_user: dict = Depends(get_admin_user)):
    db = get_db()
    await db.categories.update_one(
        {"name": name},
        {"$set": {"enabled": payload.get("enabled", True)}}
    )
    await policy_engine.refresh_policies()
    return {"message": "Category updated"}

@router.get("/", response_model=List[PolicyResponse])
async def get_policies(current_user: dict = Depends(get_admin_user)):
    db = get_db()
    cursor = db.policies.find()
    policies = await cursor.to_list(length=1000)
    for p in policies:
        p["_id"] = str(p["_id"])
    return policies

@router.post("/", response_model=PolicyResponse)
async def create_policy(policy_in: PolicyCreate, current_user: dict = Depends(get_admin_user)):
    db = get_db()
    policy_dict = policy_in.dict()
    policy_dict["created_at"] = datetime.utcnow()
    
    result = await db.policies.insert_one(policy_dict)
    policy_dict["_id"] = str(result.inserted_id)
    
    # Refresh engine memory
    await policy_engine.refresh_policies()
    
    return policy_dict

@router.delete("/{policy_id}")
async def delete_policy(policy_id: str, current_user: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.policies.delete_one({"_id": ObjectId(policy_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Refresh engine memory
    await policy_engine.refresh_policies()
    
    return {"message": "Policy deleted successfully"}
