from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from config import settings
import os

router = APIRouter()

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    if os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_PATH):
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
        firebase_admin.initialize_app(cred)
    else:
        print("⚠️  Warning: Firebase service account key not found. Authentication will not work.")


class WalletAuthRequest(BaseModel):
    walletAddress: str


class WalletAuthResponse(BaseModel):
    token: str


@router.post("/wallet", response_model=WalletAuthResponse)
async def authenticate_wallet(request: WalletAuthRequest):
    """
    Generate a custom Firebase token for wallet authentication
    """
    # Check if Firebase is initialized
    if not firebase_admin._apps:
        raise HTTPException(
            status_code=503, 
            detail="Firebase authentication is not configured. This is optional and doesn't affect core game functionality."
        )
    
    try:
        wallet_address = request.walletAddress
        
        # Create or get user with wallet address as UID
        try:
            user = firebase_auth.get_user(wallet_address)
        except firebase_auth.UserNotFoundError:
            user = firebase_auth.create_user(uid=wallet_address)
        
        # Generate custom token
        custom_token = firebase_auth.create_custom_token(wallet_address)
        
        return WalletAuthResponse(token=custom_token.decode('utf-8'))
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@router.get("/verify/{wallet_address}")
async def verify_wallet(wallet_address: str):
    """
    Verify if a wallet address is registered
    """
    try:
        user = firebase_auth.get_user(wallet_address)
        return {
            "exists": True,
            "uid": user.uid,
            "created_at": user.user_metadata.creation_timestamp,
        }
    except firebase_auth.UserNotFoundError:
        return {"exists": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
