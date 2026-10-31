let Redis;
try {
  Redis = require('ioredis');
} catch (e) {
  // ioredis not installed or unavailable
}

// In-memory fallback cache when Redis server is offline or connecting
const memoryCache = new Map();

// Periodic cleanup of expired in-memory items (every 30 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of memoryCache.entries()) {
    if (item.expiresAt && item.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }
}, 30000);

let isRedisConnected = false;
let redisClient = null;

if (Redis) {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 2) {
          return null; // Stop reconnecting, rely on fast memory cache
        }
        return 500;
      },
      enableOfflineQueue: false,
      connectTimeout: 1000
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('⚡ Redis Cache Connected successfully.');
    });

    redisClient.on('ready', () => {
      isRedisConnected = true;
    });

    redisClient.on('error', () => {
      isRedisConnected = false;
    });

    redisClient.on('close', () => {
      isRedisConnected = false;
    });

    // Attempt non-blocking connection
    redisClient.connect().catch(() => {
      // Non-fatal, memory cache fallback is active
    });
  } catch (e) {
    // Rely on memory cache
  }
}

/**
 * Retrieve cached JSON value
 * @param {string} key
 * @returns {Promise<any|null>}
 */
async function getCache(key) {
  // 1. Try Redis if connected
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (err) {
      // Fallback to memory
    }
  }

  // 2. Memory cache fallback
  const item = memoryCache.get(key);
  if (item) {
    if (!item.expiresAt || item.expiresAt > Date.now()) {
      return item.value;
    }
    memoryCache.delete(key);
  }
  return null;
}

/**
 * Set cached value with TTL in seconds
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlSeconds=60]
 */
async function setCache(key, value, ttlSeconds = 60) {
  // 1. Always update memory cache for instantaneous reads
  memoryCache.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null
  });

  // 2. Persist to Redis if available
  if (isRedisConnected && redisClient) {
    try {
      const strVal = JSON.stringify(value);
      if (ttlSeconds) {
        await redisClient.setex(key, ttlSeconds, strVal);
      } else {
        await redisClient.set(key, strVal);
      }
    } catch (err) {
      // Silently ignore write errors
    }
  }
}

/**
 * Delete a specific key from cache
 * @param {string} key
 */
async function delCache(key) {
  memoryCache.delete(key);
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
    } catch (err) {}
  }
}

/**
 * Invalidate all cache keys matching a pattern (e.g., 'renters:*')
 * @param {string} pattern
 */
async function delByPattern(pattern) {
  // 1. Clear from memory cache
  const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  for (const key of memoryCache.keys()) {
    if (regexPattern.test(key)) {
      memoryCache.delete(key);
    }
  }

  // 2. Clear from Redis
  if (isRedisConnected && redisClient) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys && keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (err) {}
  }
}

module.exports = {
  redisClient,
  getCache,
  setCache,
  delCache,
  delByPattern
};
