from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", "8000"))  # Railway uses PORT env variable
    DEBUG: bool = False
    
    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:3000"
    
    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""
    
    # AI API Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash-lite"
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_MODEL: str = "deepseek-chat"
    
    # Firebase Configuration
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "serviceAccountKey.json"
    
    # OneChain Configuration
    ONECHAIN_PACKAGE_ID: str = "0x2965e5ecb6bb4c48f098d16d3ce8bb9e8f4e80ea479a7edc9b00592a0e4dfa19"
    ONECHAIN_MARKETPLACE_ID: str = "0xfb5ab0c4845bc4f7ad6cb0b6f25e24e78fd18f3868b9be8ff050711f4227e2a3"
    ONECHAIN_NETWORK: str = "testnet"
    ONECHAIN_RPC_URL: str = "https://rpc-testnet.onelabs.cc:443"
    
    # PokéAPI Configuration
    POKEAPI_BASE_URL: str = "https://pokeapi.co/api/v2"
    POKEMON_CACHE_TTL: int = 86400  # 24 hours
    
    # Game Configuration
    STARTER_POKEMON_IDS: str = "1,4,7,25,133,152,155,158,175"
    ENCOUNTER_COOLDOWN_MINUTES: int = 5
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def starter_pokemon_ids_list(self) -> List[int]:
        return [int(id.strip()) for id in self.STARTER_POKEMON_IDS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
