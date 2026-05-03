import asyncio
from datetime import datetime
from backend.database import connect_to_mongo, close_mongo_connection, get_db
from backend.services.policy_engine import policy_engine

# Professional Institutional Policy Set
CATEGORIES = [
    {"name": "Social Media", "description": "Social networking and microblogging platforms"},
    {"name": "Adult Content", "description": "Sexually explicit and NSFW materials"},
    {"name": "Gambling", "description": "Online betting, casinos, and lottery platforms"},
    {"name": "Piracy", "description": "Unauthorized content distribution and torrents"},
    {"name": "Malware & Hacking", "description": "Security threats, exploits, and phishing"},
    {"name": "Entertainment", "description": "Streaming, gaming, and non-educational media"},
    {"name": "General", "description": "Generic productivity and safety filters"}
]

POLICIES = [
    # Adult Content (Keyword)
    {"type": "keyword", "value": "porn", "category": "Adult Content", "reason": "NSFW - Explicit Content"},
    {"type": "keyword", "value": "xxx", "category": "Adult Content", "reason": "NSFW - Explicit Content"},
    {"type": "keyword", "value": "sex", "category": "Adult Content", "reason": "NSFW - Explicit Content"},
    {"type": "keyword", "value": "adult", "category": "Adult Content", "reason": "Restricted Material"},
    {"type": "keyword", "value": "naked", "category": "Adult Content", "reason": "NSFW"},
    
    # Gambling (Keyword)
    {"type": "keyword", "value": "casino", "category": "Gambling", "reason": "Gambling Regulation"},
    {"type": "keyword", "value": "betting", "category": "Gambling", "reason": "Gambling Regulation"},
    {"type": "keyword", "value": "poker", "category": "Gambling", "reason": "Non-educational Gaming"},
    {"type": "keyword", "value": "jackpot", "category": "Gambling", "reason": "Gambling Regulation"},
    
    # Social Media (Blacklist & Keyword)
    {"type": "blacklist", "value": "facebook.com", "category": "Social Media", "reason": "Productivity Management"},
    {"type": "blacklist", "value": "instagram.com", "category": "Social Media", "reason": "Productivity Management"},
    {"type": "blacklist", "value": "tiktok.com", "category": "Social Media", "reason": "Productivity Management"},
    {"type": "blacklist", "value": "twitter.com", "category": "Social Media", "reason": "Productivity Management"},
    {"type": "blacklist", "value": "x.com", "category": "Social Media", "reason": "Productivity Management"},
    {"type": "blacklist", "value": "reddit.com", "category": "Social Media", "reason": "Unfiltered Community Content"},
    
    # Piracy (Keyword)
    {"type": "keyword", "value": "torrent", "category": "Piracy", "reason": "Copyright & Bandwidth"},
    {"type": "keyword", "value": "piratebay", "category": "Piracy", "reason": "Copyright Violation"},
    {"type": "keyword", "value": "1337x", "category": "Piracy", "reason": "Copyright Violation"},
    {"type": "keyword", "value": "keygen", "category": "Piracy", "reason": "Malware Risk / Piracy"},
    
    # Malware & Hacking (Keyword)
    {"type": "keyword", "value": "exploit", "category": "Malware & Hacking", "reason": "Security Threat"},
    {"type": "keyword", "value": "metasploit", "category": "Malware & Hacking", "reason": "Cybersecurity Risk"},
    {"type": "keyword", "value": "phishing", "category": "Malware & Hacking", "reason": "Fraud Prevention"},
    {"type": "keyword", "value": "spoof", "category": "Malware & Hacking", "reason": "Identity Theft Risk"},
    
    # Entertainment (Blacklist & Keyword)
    {"type": "blacklist", "value": "netflix.com", "category": "Entertainment", "reason": "Bandwidth Management"},
    {"type": "blacklist", "value": "youtube.com", "category": "Entertainment", "reason": "Optional Restriction"},
    {"type": "keyword", "value": "roblox", "category": "Entertainment", "reason": "Gaming - Non-educational"},
    {"type": "keyword", "value": "steam", "category": "Entertainment", "reason": "Gaming - Non-educational"},
    {"type": "keyword", "value": "twitch.tv", "category": "Entertainment", "reason": "Gaming/Streaming"}
]

async def seed():
    print("Starting Security Policy Seeding...")
    await connect_to_mongo()
    db = get_db()
    
    # 1. Update Categories
    for cat in CATEGORIES:
        await db.categories.update_one(
            {"name": cat["name"]},
            {"$set": {**cat, "enabled": True}},
            upsert=True
        )
    print(f"Categories Synchronized: {len(CATEGORIES)}")
    
    # 2. Update Policies
    count = 0
    for pol in POLICIES:
        exists = await db.policies.find_one({"value": pol["value"], "type": pol["type"]})
        if not exists:
            await db.policies.insert_one({
                **pol,
                "created_at": datetime.utcnow()
            })
            count += 1
            
    print(f"New Policies Injected: {count}")
    
    # 3. Refresh Policy Engine Cache
    await policy_engine.refresh_policies()
    print("Policy Engine Cache Refreshed")
    
    await close_mongo_connection()
    print("Seeding Complete!")


if __name__ == "__main__":
    asyncio.run(seed())
