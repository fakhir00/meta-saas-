import asyncio
import os
import time
from datetime import UTC, date, datetime, timedelta

try:
    import psycopg
except Exception:  # pragma: no cover - optional dependency for local-only runs
    psycopg = None

_rpm_state: dict[str, list[float]] = {}
_lock = asyncio.Lock()

MODEL_LIMITS = {
    "google/gemini-2.5-flash": {"rpm": 10, "rpd": 250},
    "google/gemini-2.5-flash-lite-preview-06-17": {"rpm": 15, "rpd": 1000},
    "gemini-2.5-flash": {"rpm": 10, "rpd": 250},
    "gemini-2.5-flash-lite": {"rpm": 15, "rpd": 1000},
    "default": {"rpm": 20, "rpd": 2000},
}


def _db_url() -> str | None:
    return os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")


async def _throttle_memory(model: str) -> None:
    async with _lock:
        limit = MODEL_LIMITS.get(model, MODEL_LIMITS["default"])["rpm"]
        now = time.time()
        timestamps = _rpm_state.get(model, [])
        timestamps = [stamp for stamp in timestamps if now - stamp < 60]
        if len(timestamps) >= limit:
            wait = 61 - (now - timestamps[0])
            await asyncio.sleep(max(wait, 1))
        timestamps.append(time.time())
        _rpm_state[model] = timestamps


def _throttle_db_blocking(model: str, db_url: str) -> None:
    limits = MODEL_LIMITS.get(model, MODEL_LIMITS["default"])

    with psycopg.connect(db_url, autocommit=False) as conn:
        while True:
            now = datetime.now(UTC)
            today = date.today()
            one_minute_ago = now - timedelta(seconds=60)

            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO rate_limit_state (model, day, rpm_timestamps, daily_count, updated_at)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (model) DO NOTHING
                    """,
                    (model, today, [], 0, now),
                )

                cur.execute(
                    """
                    SELECT day, rpm_timestamps, daily_count
                    FROM rate_limit_state
                    WHERE model = %s
                    FOR UPDATE
                    """,
                    (model,),
                )
                row = cur.fetchone()
                if row is None:
                    conn.rollback()
                    raise RuntimeError("rate_limit_state row could not be initialized")

                state_day, timestamps, daily_count = row
                parsed_timestamps: list[datetime] = []
                for ts in timestamps or []:
                    if isinstance(ts, datetime):
                        parsed_timestamps.append(ts)

                if state_day != today:
                    parsed_timestamps = []
                    daily_count = 0

                if daily_count >= limits["rpd"]:
                    conn.rollback()
                    raise RuntimeError(f"Daily limit reached for {model}")

                parsed_timestamps = [ts for ts in parsed_timestamps if ts > one_minute_ago]

                if len(parsed_timestamps) >= limits["rpm"]:
                    wait_seconds = max(1.0, 61.0 - (now - parsed_timestamps[0]).total_seconds())
                    conn.commit()
                    time.sleep(wait_seconds)
                    continue

                parsed_timestamps.append(now)
                daily_count += 1

                cur.execute(
                    """
                    UPDATE rate_limit_state
                    SET day = %s,
                        rpm_timestamps = %s,
                        daily_count = %s,
                        updated_at = %s
                    WHERE model = %s
                    """,
                    (today, parsed_timestamps, daily_count, now, model),
                )
                conn.commit()
                return


async def throttle(model: str) -> None:
    if os.getenv("FALLBACK_MODEL", "gemini").strip().lower() == "mock":
        return

    db_url = _db_url()
    if not db_url or psycopg is None:
        await _throttle_memory(model)
        return

    try:
        await asyncio.to_thread(_throttle_db_blocking, model, db_url)
    except Exception:
        # Keep local development usable even if DB connectivity is misconfigured.
        await _throttle_memory(model)

