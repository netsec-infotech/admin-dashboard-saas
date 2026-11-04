/**
 * In-memory sliding-window rate limiter for auth, settings, payment, and remote-control.
 * Redis is preferred when available; falls back to process memory.
 */

const buckets = new Map();

function pruneBucket(key, windowMs) {
  const now = Date.now();
  const entries = buckets.get(key) || [];
  const fresh = entries.filter((t) => now - t < windowMs);
  buckets.set(key, fresh);
  return fresh;
}

function createRateLimiter({ windowMs = 60_000, max = 60, keyPrefix = 'rl', message } = {}) {
  return (req, res, next) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
      .toString()
      .split(',')[0]
      .trim();
    const userPart = req.userId || req.user?.userId || 'anon';
    const key = `${keyPrefix}:${ip}:${userPart}`;
    const hits = pruneBucket(key, windowMs);
    if (hits.length >= max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        status: 'error',
        code: 'RATE_LIMITED',
        message: message || 'Too many requests. Please try again later.',
        retry_after_seconds: Math.ceil(windowMs / 1000),
      });
    }
    hits.push(Date.now());
    buckets.set(key, hits);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - hits.length)));
    next();
  };
}

const authLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 10,
  keyPrefix: 'auth',
  message: 'Too many authentication attempts. Wait one minute and retry.',
});

const settingsLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 40,
  keyPrefix: 'settings',
  message: 'Settings write rate exceeded.',
});

const paymentLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 30,
  keyPrefix: 'payment',
  message: 'Payment endpoint rate exceeded.',
});

const remoteControlLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 8,
  keyPrefix: 'remote',
  message: 'Remote control rate exceeded. Safety throttle engaged.',
});

const kycLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 20,
  keyPrefix: 'kyc',
  message: 'KYC review rate exceeded.',
});

module.exports = {
  createRateLimiter,
  authLimiter,
  settingsLimiter,
  paymentLimiter,
  remoteControlLimiter,
  kycLimiter,
};
