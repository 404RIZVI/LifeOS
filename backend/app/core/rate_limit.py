"""
Rate limiting for sensitive endpoints (login, register, password reset,
contact form, AI requests).

Backed by Redis so limits are correct across multiple app instances (a
per-process in-memory counter would let an attacker bypass limits just by
hitting a different instance behind the load balancer).

Failure mode: if Redis is unreachable, requests are allowed through
(fail-open) rather than every login/register/etc. request returning 500.
Rate limiting is defense-in-depth on top of account lockout and password
hashing cost, not the only control -- losing it temporarily during a Redis
outage is preferable to taking the whole auth flow down with it. Each
fail-open is logged so a Redis outage is visible in monitoring.
"""
import logging
import time

import redis.asyncio as aioredis
from fastapi import HTTPException, Request, status

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger("lifeos.rate_limit")
_redis: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis


def _parse_rate(rate: str) -> tuple[int, int]:
    """'5/minute' -> (5, 60)."""
    count_str, _, period = rate.partition("/")
    seconds_by_period = {"second": 1, "minute": 60, "hour": 3600, "day": 86400}
    return int(count_str), seconds_by_period[period]


class RateLimiter:
    """Usage: Depends(RateLimiter(settings.RATE_LIMIT_LOGIN, scope="login"))"""

    def __init__(self, rate: str, scope: str):
        self.limit, self.window_seconds = _parse_rate(rate)
        self.scope = scope

    async def __call__(self, request: Request) -> None:
        client_ip = request.client.host if request.client else "unknown"
        key = f"ratelimit:{self.scope}:{client_ip}"

        try:
            r = get_redis()
            now = time.time()
            window_start = now - self.window_seconds

            pipe = r.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, self.window_seconds)
            results = await pipe.execute()
        except (aioredis.RedisError, ConnectionError, OSError) as exc:
            logger.warning("Rate limiter unavailable (%s) -- failing open for scope=%s", exc, self.scope)
            return

        request_count = results[2]
        if request_count > self.limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please slow down and try again shortly.",
            )
