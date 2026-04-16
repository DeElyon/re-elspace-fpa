// server/src/middleware/rateLimit.middleware.ts
import rateLimit from 'express-rate-limit'
// @ts-ignore
import RedisStore from 'rate-limit-redis'
import { redis } from '../config/redis'

export const apiRateLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redis.sendCommand(args),
    prefix: 'rate-limit:api:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

export const authRateLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redis.sendCommand(args),
    prefix: 'rate-limit:auth:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later.',
})

export const withdrawalRateLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redis.sendCommand(args),
    prefix: 'rate-limit:withdrawal:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each user to 3 withdrawal requests per hour
  // @ts-ignore
  keyGenerator: (req: any) => req.user?.id || req.ip,
  message: 'Withdrawal limit reached. Please try again later.',
})
