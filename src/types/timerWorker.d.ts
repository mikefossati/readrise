export type TimerWorkerMessage =
  | { type: 'START'; payload: { duration: number } }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' };

export type TimerWorkerTick = { type: 'TICK'; payload: { remaining: number } };
export type TimerWorkerDone = { type: 'DONE' };
export type TimerWorkerResponse = TimerWorkerTick | TimerWorkerDone;
