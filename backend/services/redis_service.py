import redis.asyncio as redis
import json
from typing import Optional, Any
from config import settings


class RedisService:
    def __init__(self):
        self.client: Optional[redis.Redis] = None
    
    async def connect(self):
        """Connect to Redis"""
        self.client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
            decode_responses=True,
        )
        await self.client.ping()
    
    async def close(self):
        """Close Redis connection"""
        if self.client:
            await self.client.close()
    
    async def ping(self) -> bool:
        """Check if Redis is connected"""
        try:
            if self.client:
                await self.client.ping()
                return True
        except:
            pass
        return False
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from Redis"""
        if not self.client:
            return None
        
        value = await self.client.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in Redis with optional TTL"""
        if not self.client:
            return
        
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        
        if ttl:
            await self.client.setex(key, ttl, value)
        else:
            await self.client.set(key, value)
    
    async def delete(self, key: str):
        """Delete key from Redis"""
        if self.client:
            await self.client.delete(key)
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in Redis"""
        if not self.client:
            return False
        return await self.client.exists(key) > 0


# Global Redis service instance
redis_service = RedisService()
