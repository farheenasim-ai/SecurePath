from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import connect_to_mongo, close_mongo_connection, get_db
from backend.routes import auth, policy, check, logs, dashboard, alerts
from backend.services.policy_engine import policy_engine
from backend.auth import get_password_hash
from datetime import datetime

app = FastAPI(title="SecurePath API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router, prefix="/api")
app.include_router(policy.router, prefix="/api")
app.include_router(check.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    db = get_db()
    
    # Initialize demo data if DB is empty
    user_count = await db.users.count_documents({})
    if user_count == 0:
        print("Initializing demo data...")
        # Create Admin
        await db.users.insert_one({
            "username": "admin",
            "email": "admin@securepath.com",
            "password": get_password_hash("admin123"),
            "role": "admin",
            "created_at": datetime.utcnow()
        })
        # Create Student
        await db.users.insert_one({
            "username": "student",
            "email": "student@institution.edu",
            "password": get_password_hash("student123"),
            "role": "student",
            "created_at": datetime.utcnow()
        })
        
        # Seed categories
        await db.categories.insert_many([
            {"name": "Social Media", "enabled": True, "description": "Social networking sites"},
            {"name": "Adult Content", "enabled": True, "description": "Explicit content"},
            {"name": "Gambling", "enabled": True, "description": "Betting and gambling sites"},
            {"name": "Piracy", "enabled": True, "description": "Copyrighted content sharing"}
        ])

        # Seed policies
        await db.policies.insert_many([
            {"type": "blacklist", "value": "facebook.com", "category": "Social Media", "reason": "Non-educational", "created_at": datetime.utcnow()},
            {"type": "blacklist", "value": "instagram.com", "category": "Social Media", "reason": "Non-educational", "created_at": datetime.utcnow()},
            {"type": "blacklist", "value": "adult.com", "category": "Adult Content", "reason": "Policy Violation", "created_at": datetime.utcnow()},
            {"type": "keyword", "value": "gambling", "category": "Gambling", "reason": "Institutional Safety", "created_at": datetime.utcnow()},
            {"type": "keyword", "value": "torrent", "category": "Piracy", "reason": "Bandwidth Control", "created_at": datetime.utcnow()}
        ])
    
    # Initialize Policy Engine
    await policy_engine.refresh_policies()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "SecurePath API is running", "version": "1.0.0"}
