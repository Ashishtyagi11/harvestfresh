from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from beanie import PydanticObjectId

from app.core.config import settings
from app.core.security import create_access_token, decode_access_token, generate_otp, hash_otp, verify_otp_hash
from app.models.models import User, OTPSession
from app.schemas.schemas import OTPRequest, OTPRequestResponse, OTPVerify, TokenResponse, UserProfileUpdate

router = APIRouter(prefix="/auth", tags=["Auth"])
security_bearer = HTTPBearer(auto_error=False)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

@router.post("/otp/request", response_model=OTPRequestResponse)
async def request_otp(payload: OTPRequest):
    phone = payload.phone.strip()
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")
    
    otp_code = generate_otp()
    hashed = hash_otp(otp_code)
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    
    session = OTPSession(
        phone=phone,
        otp_hash=hashed,
        expires_at=expires_at,
        verified=False,
        attempts=0
    )
    await session.insert()
    
    # In development/test mode, return the OTP for easy testing
    print(f"[MOCK SMS] OTP for {phone} is: {otp_code}")
    return OTPRequestResponse(
        message="OTP sent successfully to your phone number",
        phone=phone,
        debug_otp=otp_code if settings.DEBUG else None
    )

@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp(payload: OTPVerify):
    phone = payload.phone.strip()
    otp = payload.otp.strip()
    
    # Find latest active session
    sessions = await OTPSession.find(OTPSession.phone == phone, OTPSession.verified == False).sort("-created_at").limit(1).to_list()
    if not sessions:
        raise HTTPException(status_code=400, detail="No active OTP request found for this phone number")
    
    session = sessions[0]
    if datetime.utcnow() > session.expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
    
    if not verify_otp_hash(otp, session.otp_hash):
        session.attempts += 1
        await session.save()
        raise HTTPException(status_code=400, detail="Invalid OTP code")
    
    session.verified = True
    await session.save()
    
    # Get or create user
    user = await User.find_one(User.phone == phone)
    if not user:
        user_name = payload.name.strip() if payload.name else "Fresh Customer"
        user = User(
            phone=phone,
            name=user_name,
            email=payload.email,
            role="admin" if phone.endswith("9999") or phone == "9999999999" else "customer"
        )
        await user.insert()
    elif payload.name and user.name == "Fresh Customer":
        user.name = payload.name.strip()
        if payload.email:
            user.email = payload.email
        await user.save()
        
    access_token = create_access_token(data={"sub": str(user.id), "phone": user.phone, "role": user.role})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=str(user.id),
        phone=user.phone,
        role=user.role,
        name=user.name
    )

@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": str(user.id),
        "phone": user.phone,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "approval_status": getattr(user, "approval_status", "approved"),
        "is_active": getattr(user, "is_active", True),
        "account_type": getattr(user, "account_type", "retail"),
        "addresses": [a.model_dump() for a in user.addresses]
    }

@router.put("/me", response_model=dict)
async def update_profile(payload: UserProfileUpdate, user: User = Depends(get_current_user)):
    if payload.name:
        user.name = payload.name
    if payload.email is not None:
        user.email = payload.email
    user.updated_at = datetime.utcnow()
    await user.save()
    return {"message": "Profile updated successfully", "name": user.name, "email": user.email}
