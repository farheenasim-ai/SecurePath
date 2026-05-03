from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

# User Models
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "student" # student or admin

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    created_at: datetime

# Auth Models
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Policy Models
class PolicyBase(BaseModel):
    type: str  # blacklist or keyword
    value: str
    category: str = "General"
    reason: Optional[str] = None

class PolicyCreate(PolicyBase):
    pass

class PolicyResponse(PolicyBase):
    id: str = Field(alias="_id")
    created_at: datetime

# URL Check Models
class URLCheckRequest(BaseModel):
    url: str

class URLCheckResponse(BaseModel):
    status: str  # ALLOW or BLOCK
    reason: Optional[str] = None
    matched_rule: Optional[str] = None
    category: Optional[str] = None
    layer: str = "Policy Engine"

# Category Models
class CategoryBase(BaseModel):
    name: str
    enabled: bool = True
    description: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: str = Field(alias="_id")

# Alert Models
class AlertResponse(BaseModel):
    id: str = Field(alias="_id")
    username: str
    violations_count: int
    last_violation_url: str
    timestamp: datetime

# Log Models
class AccessLog(BaseModel):
    username: str
    url: str
    decision: str
    reason: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    role: str
    category: Optional[str] = None
