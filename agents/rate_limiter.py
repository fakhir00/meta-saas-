import json, time
from pathlib import Path
from datetime import datetime, timezone

try:
    import fcntl
except ImportError:  # pragma: no cover - Windows fallback
    fcntl = None
    import msvcrt

RATE_STATE_FILE = Path('state/rate_limit_state.json')

FREE_TIER_LIMITS = {
    'gemini-2.5-flash':      {'rpm': 10, 'rpd': 250},
    'gemini-2.5-flash-lite': {'rpm': 15, 'rpd': 1000},
}

def _load_state(f) -> dict:
    try:
        return json.load(f)
    except Exception:
        return {}


def _lock_file(fh) -> None:
    if fcntl is not None:
        fcntl.flock(fh, fcntl.LOCK_EX)
        return
    fh.seek(0)
    if fh.tell() == 0 and fh.read(1) == '':
        fh.write(' ')
        fh.flush()
    fh.seek(0)
    msvcrt.locking(fh.fileno(), msvcrt.LK_LOCK, 1)


def _unlock_file(fh) -> None:
    if fcntl is not None:
        fcntl.flock(fh, fcntl.LOCK_UN)
        return
    fh.seek(0)
    msvcrt.locking(fh.fileno(), msvcrt.LK_UNLCK, 1)

def record_and_check(model: str):
    RATE_STATE_FILE.parent.mkdir(exist_ok=True)
    with open(RATE_STATE_FILE, 'a+') as fh:
        _lock_file(fh)
        fh.seek(0)
        state = _load_state(fh)
        today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        m = state.setdefault(model, {'day': today, 'count': 0, 'timestamps': []})
        if m['day'] != today:
            m.update({'day': today, 'count': 0, 'timestamps': []})
        limit = FREE_TIER_LIMITS[model]
        if m['count'] >= limit['rpd']:
            raise RuntimeError(f'Daily limit reached for {model}')
        now = time.time()
        m['timestamps'] = [t for t in m['timestamps'] if now - t < 60]
        if len(m['timestamps']) >= limit['rpm']:
            wait = 61 - (now - m['timestamps'][0])
            time.sleep(max(wait, 1))
        m['timestamps'].append(time.time())
        m['count'] += 1
        fh.seek(0)
        fh.truncate()
        json.dump(state, fh)
        _unlock_file(fh)
