#!/usr/bin/env python3
"""Test script to verify DeepSeek API configuration"""

import sys
from config.settings import settings
from openai import OpenAI

print("=" * 50)
print("DeepSeek API Configuration Test")
print("=" * 50)

print(f"\n✓ DEEPSEEK_API_KEY: {'*' * 20}{settings.DEEPSEEK_API_KEY[-10:] if settings.DEEPSEEK_API_KEY else 'NOT SET'}")
print(f"✓ DEEPSEEK_MODEL: {settings.DEEPSEEK_MODEL}")

if not settings.DEEPSEEK_API_KEY:
    print("\n❌ ERROR: DEEPSEEK_API_KEY is not set!")
    print("Please check your .env file")
    sys.exit(1)

try:
    print("\n✓ openai package is installed")
    
    # Initialize client
    client = OpenAI(
        api_key=settings.DEEPSEEK_API_KEY,
        base_url="https://api.deepseek.com"
    )
    print("✓ DeepSeek client initialized")
    
    # Test API call
    response = client.chat.completions.create(
        model=settings.DEEPSEEK_MODEL,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say hello in one word"}
        ],
        max_tokens=10
    )
    print(f"✓ API Test Response: {response.choices[0].message.content}")
    
    print("\n" + "=" * 50)
    print("✅ All tests passed! DeepSeek API is working!")
    print("=" * 50)
    
except ImportError as e:
    print(f"\n❌ ERROR: {e}")
    print("Run: pip install openai")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    sys.exit(1)
