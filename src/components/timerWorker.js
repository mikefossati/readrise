// Simple timer worker for accurate countdown
let interval = null;
let startTime = 0;
let duration = 0;
let paused = false;
let pausedAt = 0;

self.onmessage = function(e) {
  const { type, payload } = e.data;
  if (type === 'START') {
    duration = payload.duration;
    startTime = performance.now();
    paused = false;
    tick();
  } else if (type === 'PAUSE') {
    paused = true;
    pausedAt = performance.now();
    clearInterval(interval);
  } else if (type === 'RESUME') {
    if (paused) {
      startTime += performance.now() - pausedAt;
      paused = false;
      tick();
    }
  } else if (type === 'STOP') {
    clearInterval(interval);
  }
};

function tick() {
  clearInterval(interval);
  interval = setInterval(() => {
    if (paused) return;
    const elapsed = Math.floor((performance.now() - startTime) / 1000);
    const remaining = Math.max(duration - elapsed, 0);
    self.postMessage({ type: 'TICK', payload: { remaining } });
    if (remaining <= 0) {
      clearInterval(interval);
      self.postMessage({ type: 'DONE' });
    }
  }, 500);
}
