type AttemptState = {
  count: number;
  firstFailedAt: number;
  blockedUntil?: number;
};

const attempts = new Map<string, AttemptState>();
const WINDOW_MS = 10 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function isLoginBlocked(key: string) {
  const now = Date.now();
  const state = attempts.get(key);
  if (!state?.blockedUntil) return false;
  if (state.blockedUntil > now) return true;
  attempts.delete(key);
  return false;
}

export function registerFailedLogin(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || now - current.firstFailedAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstFailedAt: now });
    return;
  }

  const nextCount = current.count + 1;
  const blockedUntil = nextCount >= MAX_ATTEMPTS ? now + BLOCK_MS : current.blockedUntil;
  attempts.set(key, {
    count: nextCount,
    firstFailedAt: current.firstFailedAt,
    blockedUntil
  });
}

export function clearFailedLogins(key: string) {
  attempts.delete(key);
}
