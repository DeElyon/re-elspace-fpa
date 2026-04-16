// server/src/config/redis.ts
import { createClient } from 'redis'

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

redis.on('error', (err) => console.log('Redis Client Error', err))

// Connect to redis
if (process.env.NODE_ENV !== 'test') {
  redis.connect().catch(console.error)
}

export { redis }
