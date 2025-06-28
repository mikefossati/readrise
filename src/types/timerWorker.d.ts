export interface TimerWorkerMessage {
  type: 'START' | 'PAUSE' | 'RESUME' | 'STOP';
  payload?: {
    duration?: number;
  };
}

export interface TimerWorkerTick {
  type: 'TICK';
  payload: { remaining: number };
}

export interface TimerWorkerDone {
  type: 'DONE';
}
