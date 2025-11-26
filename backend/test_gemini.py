#!/usr/bin/env python3
"""Test script to verify Gemini API configuration"""

import sys
from config.settings import settings

print("=" * 50)
print("Gemini API Configuration Test")
print("=" * 50)

print(f"\n✓ GEMINI_API_KEY: {'*' * 20}{settings.GEMINI_API_KEY[-10:] if settings.GEMINI_API_KEY else 'NOT SET'}")
print(f"✓ GEMINI_MODEL: {settings.GEMINI_MODEL}")

if not settings.GEMINI_API_KEY:
    print("\n❌ ERROR: GEMINI_API_KEY is not set!")
    print("Please check your .env file")
    sys.exit(1)

try:
    import google.generativeai as genai
    print("\n✓ google-generativeai package is installed")
    
    genai.configure(api_key=settings.GEMINI_API_KEY)
    print("✓ Gemini API configured successfully")
    
    # Test API call
    model = genai.GenerativeModel(settings.GEMINI_MODEL)
    response = model.generate_content("Say hello in one word")
    print(f"✓ API Test Response: {response.text}")
    
    print("\n" + "=" * 50)
    print("✅ All tests passed! Gemini API is working!")
    print("=" * 50)
    
except ImportError as e:
    print(f"\n❌ ERROR: {e}")
    print("Run: pip install google-generativeai")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    sys.exit(1)
