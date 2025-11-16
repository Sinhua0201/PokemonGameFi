"""
Quick script to test Railway deployment
Usage: python test_deployment.py <your-railway-url>
"""
import sys
import httpx
import asyncio


async def test_deployment(base_url: str):
    """Test all critical endpoints"""
    
    print(f"🧪 Testing deployment at: {base_url}\n")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        tests = [
            ("Root", "/"),
            ("Health Check", "/health"),
            ("Pokemon API", "/api/pokemon/1"),
            ("Pokemon List", "/api/pokemon?limit=5"),
        ]
        
        results = []
        
        for name, endpoint in tests:
            url = f"{base_url}{endpoint}"
            try:
                print(f"Testing {name}... ", end="")
                response = await client.get(url)
                
                if response.status_code == 200:
                    print(f"✅ OK ({response.status_code})")
                    results.append((name, True, response.status_code))
                else:
                    print(f"❌ FAILED ({response.status_code})")
                    results.append((name, False, response.status_code))
                    
            except Exception as e:
                print(f"❌ ERROR: {str(e)}")
                results.append((name, False, str(e)))
        
        print("\n" + "="*50)
        print("SUMMARY")
        print("="*50)
        
        passed = sum(1 for _, success, _ in results if success)
        total = len(results)
        
        for name, success, info in results:
            status = "✅" if success else "❌"
            print(f"{status} {name}: {info}")
        
        print(f"\nPassed: {passed}/{total}")
        
        if passed == total:
            print("\n🎉 All tests passed! Deployment is healthy.")
            return True
        else:
            print("\n⚠️ Some tests failed. Check the logs above.")
            return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_deployment.py <railway-url>")
        print("Example: python test_deployment.py https://your-app.railway.app")
        sys.exit(1)
    
    url = sys.argv[1].rstrip("/")
    success = asyncio.run(test_deployment(url))
    sys.exit(0 if success else 1)
