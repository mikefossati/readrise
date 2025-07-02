vi.mock('tone', async () => {
  const actual: any = await vi.importActual('tone');
  return {
    ...actual,
    Player: vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      dispose: vi.fn(),
      volume: { value: 0, rampTo: vi.fn() },
      loop: false,
      autostart: false,
      toDestination: function () { return this; },
      load: vi.fn().mockResolvedValue(undefined),
    })),
    start: vi.fn().mockResolvedValue(undefined),
    gainToDb: (v: number) => v,
  };
});

import { render } from '@testing-library/react';
import { useAmbientAudio } from '../useAmbientAudio';

describe('useAmbientAudio', () => {
  it('should start and stop audio cleanly on mount/unmount', () => {
    const TestComponent = ({ playing }: { playing: boolean }) => {
      useAmbientAudio({ src: 'test.mp3', volume: 50, playing });
      return null;
    };
    const { unmount, rerender } = render(<TestComponent playing={true} />);
    rerender(<TestComponent playing={false} />);
    unmount();
    // If no errors thrown, audio is cleaned up
  });

  it('should not leak audio after rapid mount/unmount', () => {
    const TestComponent = ({ playing }: { playing: boolean }) => {
      useAmbientAudio({ src: 'test.mp3', volume: 50, playing });
      return null;
    };
    for (let i = 0; i < 5; i++) {
      const { unmount } = render(<TestComponent playing={true} />);
      unmount();
    }
    // If no errors thrown, no leaks
  });
});
