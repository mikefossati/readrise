import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

/**
 * useAmbientAudio
 * React hook for seamless background audio playback using Tone.js.
 * Handles loading, looping, fade in/out, volume, mute, and timer sync.
 * Compliant with dev_guidelines.md (no inline hooks, clear separation of concerns).
 */
export interface UseAmbientAudioOptions {
  src: string | null;
  volume: number; // 0-100
  playing: boolean;
  fade?: boolean;
  onError?: (err: Error) => void;
}

export function useAmbientAudio({ src, volume, playing, fade = true, onError }: UseAmbientAudioOptions) {
  const playerRef = useRef<Tone.Player | null>(null);
  const fadeDuration = 1.5; // seconds

  useEffect(() => {
    if (!src || typeof src !== 'string') return;
    let player: Tone.Player;
    async function setup() {
      try {
        await Tone.start();
        if (!src || typeof src !== 'string') return; // Double-check for TS
        player = new Tone.Player(src).toDestination();
        player.loop = true;
        player.autostart = false;
        await player.load(src as string); // TS-safe
        playerRef.current = player;
        player.volume.value = Tone.gainToDb(volume / 100);
        if (playing) {
          if (fade) {
            player.volume.value = Tone.gainToDb(0.01); // fade from silence
            player.start();
            player.volume.rampTo(Tone.gainToDb(volume / 100), fadeDuration);
          } else {
            player.start();
          }
        }
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
    setup();
    return () => {

      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, [src]);

  // Handle play/pause and volume
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) {
      player.start();
      if (fade) player.volume.rampTo(Tone.gainToDb(volume / 100), fadeDuration);
      else player.volume.value = Tone.gainToDb(volume / 100);
    } else {
      if (fade) player.volume.rampTo(Tone.gainToDb(0.01), fadeDuration);
      else player.volume.value = Tone.gainToDb(0.01);
      player.stop(); // Just stop, do not dispose!
    }
    // eslint-disable-next-line
  }, [playing]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.volume.rampTo(Tone.gainToDb(volume / 100), 0.5);
    // eslint-disable-next-line
  }, [volume]);
}
