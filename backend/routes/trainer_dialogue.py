from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from config.settings import settings
from typing import List, Optional

router = APIRouter()

# Configure DeepSeek API (OpenAI compatible)
DEEPSEEK_API_KEY = settings.DEEPSEEK_API_KEY if hasattr(settings, 'DEEPSEEK_API_KEY') else None
DEEPSEEK_MODEL = "deepseek-chat"

# Initialize OpenAI client with DeepSeek endpoint
client = None
if DEEPSEEK_API_KEY:
    client = OpenAI(
        api_key=DEEPSEEK_API_KEY,
        base_url="https://api.deepseek.com"
    )

class Message(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = []

class ChatResponse(BaseModel):
    response: str
    success: bool
    error: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
async def chat_with_trainer(request: ChatRequest):
    """
    Chat with AI Pokémon Trainer using DeepSeek
    """
    try:
        if not client or not DEEPSEEK_API_KEY:
            raise HTTPException(status_code=500, detail="DeepSeek API key not configured")

        # System prompt for Pokémon trainer personality
        system_prompt = """You are Professor Oak, a wise and friendly Pokémon Professor. 
You help trainers learn about Pokémon, battle strategies, type advantages, evolution, and breeding.
You are enthusiastic, encouraging, and always ready to share your knowledge.
Keep your responses concise (2-3 sentences) and friendly.
Use Pokémon terminology and occasionally mention specific Pokémon examples."""

        # Build conversation messages
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add conversation history
        for msg in request.history[-10:]:  # Keep last 10 messages for context
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })

        # Call DeepSeek API
        response = client.chat.completions.create(
            model=DEEPSEEK_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=200
        )

        return ChatResponse(
            response=response.choices[0].message.content,
            success=True
        )

    except Exception as e:
        error_msg = str(e)
        print(f"Error in trainer dialogue: {error_msg}")
        
        # Handle specific error types
        if "429" in error_msg or "Resource exhausted" in error_msg:
            return ChatResponse(
                response="I apologize, but I'm currently experiencing high demand! The AI service has reached its quota limit. Please try again in a few minutes, or the developer needs to upgrade the API plan. In the meantime, feel free to explore other features of the game!",
                success=False,
                error="API quota exceeded"
            )
        elif "403" in error_msg or "API key" in error_msg:
            return ChatResponse(
                response="I'm having trouble with my credentials right now. Please contact the game administrator!",
                success=False,
                error="API authentication error"
            )
        else:
            return ChatResponse(
                response="I apologize, but I'm having trouble connecting right now. Please try again later!",
                success=False,
                error=error_msg
            )

@router.get("/health")
async def health_check():
    """Check if DeepSeek API is configured"""
    return {
        "configured": bool(DEEPSEEK_API_KEY),
        "model": DEEPSEEK_MODEL,
        "provider": "DeepSeek"
    }
