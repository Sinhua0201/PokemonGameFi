# Redis Setup Guide

Redis is used for caching Pokémon data and improving API performance.

## Option 1: Local Redis (Development)

### Windows

**Using Memurai (Redis-compatible):**

1. Download Memurai from https://www.memurai.com/get-memurai
2. Install and run Memurai
3. Redis will be available at `localhost:6379`

**Using Docker:**

```bash
docker run -d --name redis -p 6379:6379 redis:latest
```

**Using WSL2:**

```bash
# In WSL2 terminal
sudo apt-get update
sudo apt-get install redis-server
redis-server
```

### Linux

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping  # Should return PONG
```

### macOS

```bash
# Using Homebrew
brew install redis
brew services start redis

# Verify
redis-cli ping  # Should return PONG
```

## Option 2: Redis Cloud (Production)

### Free Tier Setup

1. Go to https://redis.com/try-free/
2. Sign up for a free account
3. Create a new database
4. Select "Fixed" plan (30MB free)
5. Choose a region close to your users
6. Copy the connection details

### Update .env

```env
REDIS_HOST=redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your_password_here
```

## Option 3: Upstash (Serverless Redis)

### Setup

1. Go to https://upstash.com/
2. Sign up for free account
3. Create a new Redis database
4. Select region
5. Copy connection details

### Update .env

```env
REDIS_HOST=your-database.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_password_here
```

## Verify Redis Connection

### Using redis-cli

```bash
# Connect to Redis
redis-cli

# Test connection
127.0.0.1:6379> ping
PONG

# Set a test value
127.0.0.1:6379> set test "hello"
OK

# Get the value
127.0.0.1:6379> get test
"hello"

# Exit
127.0.0.1:6379> exit
```

### Using Python

```python
import redis

# Connect
r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Test
r.ping()  # Should return True
r.set('test', 'hello')
print(r.get('test'))  # Should print 'hello'
```

### Using FastAPI Backend

Start the backend and check the health endpoint:

```bash
curl http://localhost:8000/health
```

Should return:

```json
{
  "status": "healthy",
  "redis": "connected"
}
```

## Redis Configuration

### Memory Management

Redis stores data in memory. Configure max memory:

```bash
# Edit redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### Persistence

For development, persistence is optional. For production:

```bash
# Edit redis.conf
save 900 1      # Save after 900 seconds if 1 key changed
save 300 10     # Save after 300 seconds if 10 keys changed
save 60 10000   # Save after 60 seconds if 10000 keys changed
```

## Cache Strategy

### Pokémon Data Caching

The backend caches Pokémon data from PokéAPI:

- **Key format:** `pokemon:{id}`
- **TTL:** 24 hours (86400 seconds)
- **Data:** Full Pokémon details (name, types, stats, sprite)

### Cache Warming

Pre-fetch Generation 1 Pokémon on startup:

```python
# In main.py lifespan
async def prefetch_pokemon():
    for pokemon_id in range(1, 152):  # Gen 1
        await pokemon_service.get_pokemon(pokemon_id)
```

### Cache Invalidation

Caches automatically expire after TTL. Manual invalidation:

```python
await redis_service.delete(f"pokemon:{pokemon_id}")
```

## Monitoring

### Redis CLI Monitor

Watch all commands in real-time:

```bash
redis-cli monitor
```

### Check Memory Usage

```bash
redis-cli info memory
```

### Check Connected Clients

```bash
redis-cli client list
```

### Check Keys

```bash
# Count keys
redis-cli dbsize

# List all keys (use carefully in production)
redis-cli keys "*"

# List pokemon keys
redis-cli keys "pokemon:*"
```

## Troubleshooting

### Connection Refused

```
redis.exceptions.ConnectionError: Error connecting to localhost:6379
```

**Solutions:**
- Ensure Redis is running: `redis-cli ping`
- Check if port 6379 is in use: `netstat -an | grep 6379`
- Try 127.0.0.1 instead of localhost
- Check firewall settings

### Authentication Failed

```
redis.exceptions.AuthenticationError: Authentication required
```

**Solutions:**
- Add password to .env: `REDIS_PASSWORD=your_password`
- Or disable auth in redis.conf: `# requirepass`

### Out of Memory

```
redis.exceptions.ResponseError: OOM command not allowed
```

**Solutions:**
- Increase maxmemory in redis.conf
- Change eviction policy: `maxmemory-policy allkeys-lru`
- Clear old keys: `redis-cli flushdb`

### Slow Performance

**Solutions:**
- Check memory usage: `redis-cli info memory`
- Monitor slow queries: `redis-cli slowlog get 10`
- Use pipelining for bulk operations
- Consider Redis Cluster for scaling

## Best Practices

### Development

- Use local Redis for faster development
- Don't worry about persistence
- Clear cache when testing: `redis-cli flushdb`

### Production

- Use Redis Cloud or managed service
- Enable persistence (RDB + AOF)
- Set up monitoring and alerts
- Use connection pooling
- Implement retry logic
- Set appropriate TTLs

### Security

- Always use password authentication
- Use TLS/SSL for connections
- Restrict network access
- Don't expose Redis port publicly
- Regular backups

## Performance Tips

### Connection Pooling

Already implemented in `redis_service.py`:

```python
self.client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    connection_pool=redis.ConnectionPool(max_connections=10)
)
```

### Batch Operations

Use pipelines for multiple operations:

```python
pipe = redis_service.client.pipeline()
for i in range(1, 152):
    pipe.set(f"pokemon:{i}", data)
pipe.execute()
```

### Compression

For large values, consider compression:

```python
import gzip
import json

data = json.dumps(pokemon_data)
compressed = gzip.compress(data.encode())
await redis_service.set(key, compressed)
```

## Next Steps

1. Install Redis locally or sign up for Redis Cloud
2. Update `.env` with Redis connection details
3. Start the backend: `python main.py`
4. Verify connection: `curl http://localhost:8000/health`
5. Test caching by fetching Pokémon data
6. Monitor cache hits/misses

## Resources

- [Redis Documentation](https://redis.io/docs/)
- [Redis Cloud](https://redis.com/try-free/)
- [Upstash](https://upstash.com/)
- [redis-py Documentation](https://redis-py.readthedocs.io/)
- [Memurai (Windows)](https://www.memurai.com/)
