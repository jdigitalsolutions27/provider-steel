const throttleStore = new Map<string, number>();
const WINDOW_MS = 30 * 1000;

export function canSubmit(ip: string) {
  const now = Date.now();
  const last = throttleStore.get(ip) ?? 0;
  if (now - last < WINDOW_MS) {
    return false;
  }
  throttleStore.set(ip, now);
  return true;
}
