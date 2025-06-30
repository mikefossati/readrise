// Timer worker with strict types for messages
export type TimerWorkerMessage =
  | { type: 'START'; payload: { duration: number } }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' };

export type TimerWorkerTick = { type: 'TICK'; payload: { remaining: number } };
export type TimerWorkerDone = { type: 'DONE' };
export type TimerWorkerResponse = TimerWorkerTick | TimerWorkerDone;

let interval: number | null = null;
let startTime = 0;
let duration = 0;
let paused = false;
let pausedAt = 0;

self.onmessage = function (e: MessageEvent<TimerWorkerMessage>) {
  const type = (e.data as any).type;
const payload = (e.data as any).payload;
  if (type === 'START') {
    duration = payload.duration;
    startTime = performance.now();
    paused = false;
    tick();
  } else if (type === 'PAUSE') {
    paused = true;
    pausedAt = performance.now();
    if (interval !== null) clearInterval(interval);
  } else if (type === 'RESUME') {
    if (paused) {
      startTime += performance.now() - pausedAt;
      paused = false;
      tick();
    }
  } else if (type === 'STOP') {
    if (interval !== null) clearInterval(interval);
  }
};

function tick() {
  if (interval !== null) clearInterval(interval);
  interval = setInterval(() => {
    if (paused) return;
    const elapsed = Math.floor((performance.now() - startTime) / 1000);
    const remaining = Math.max(duration - elapsed, 0);
    self.postMessage({ type: 'TICK', payload: { remaining } } as TimerWorkerTick);
    if (remaining <= 0) {
      if (interval !== null) clearInterval(interval);
      self.postMessage({ type: 'DONE' } as TimerWorkerDone);
    }
  }, 500) as unknown as number;
}
