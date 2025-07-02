// Utility hook to get the src for the selected sound
import { useEffect, useState } from 'react';

export function useSoundSrc(soundId: string) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!soundId || soundId === 'none') {
      setSrc(null);
      return;
    }
    fetch('/audio/sounds.json')
      .then(res => res.json())
      .then((sounds) => {
        const found = sounds.find((s: any) => s.id === soundId);
        setSrc(found?.src || null);
      })
      .catch(() => setSrc(null));
  }, [soundId]);

  return src;
}
