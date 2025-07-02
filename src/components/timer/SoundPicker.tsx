import React, { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import { Slider } from './Slider';
import { Button } from '../ui/button';
import { Volume2, VolumeX, Loader2, Play } from 'lucide-react';

interface SoundOption {
  id: string;
  label: string;
  preview: string | null;
  src: string | null;
}

interface SoundPickerProps {
  value: string;
  onChange: (soundId: string) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
}

const SOUNDS_JSON = '/audio/sounds.json';
const LAST_SOUND_KEY = 'readrise_last_sound';
const LAST_VOLUME_KEY = 'readrise_last_volume';

export const SoundPicker: React.FC<SoundPickerProps> = ({ value, onChange, volume, onVolumeChange }) => {
  const [sounds, setSounds] = useState<SoundOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewPlayer = useRef<Tone.Player | null>(null);

  useEffect(() => {
    fetch(SOUNDS_JSON)
      .then(res => res.json())
      .then(setSounds)
      .catch(() => setError('Failed to load sound options.'));
  }, []);

  useEffect(() => {
    // Restore last selection
    const last = localStorage.getItem(LAST_SOUND_KEY);
    if (last && sounds.find(s => s.id === last)) {
      onChange(last);
    }
    const lastVol = localStorage.getItem(LAST_VOLUME_KEY);
    if (lastVol) {
      onVolumeChange(Number(lastVol));
    }
    // eslint-disable-next-line
  }, [sounds]);

  const handlePreview = async (sound: SoundOption) => {
    if (!sound.preview) return;
    setError(null);
    setLoading(true);
    setPreviewing(sound.id);
    try {
      await Tone.start(); // Required for mobile
      if (previewPlayer.current) {
        previewPlayer.current.stop();
        previewPlayer.current.dispose();
      }
      previewPlayer.current = new Tone.Player({
        url: sound.preview,
        autostart: true,
        onstop: () => setPreviewing(null),
        onload: () => setLoading(false),
      }).toDestination();
      previewPlayer.current.volume.value = Tone.gainToDb(volume / 100);
      setTimeout(() => {
        previewPlayer.current?.stop();
        setPreviewing(null);
      }, 8000); // 8s preview
    } catch (e) {
      setError('Audio playback failed.');
      setPreviewing(null);
      setLoading(false);
    }
  };

  const handleSelect = (soundId: string) => {
    onChange(soundId);
    localStorage.setItem(LAST_SOUND_KEY, soundId);
  };

  const handleVolume = (v: number) => {
    onVolumeChange(v);
    localStorage.setItem(LAST_VOLUME_KEY, String(v));
  };

  return (
    <div className="space-y-2">
      <label className="block font-semibold mb-1">Background Sound</label>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {sounds.map(sound => (
          <div
            key={sound.id}
            className={`border rounded p-2 flex flex-col items-center cursor-pointer ${value === sound.id ? 'border-purple-500 bg-purple-900/10' : 'border-slate-700 bg-slate-800/40'}`}
            tabIndex={0}
            aria-label={sound.label}
            onClick={() => handleSelect(sound.id)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelect(sound.id)}
          >
            <span className="font-medium mb-1">{sound.label}</span>
            {sound.preview && (
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Preview ${sound.label}`}
                onClick={e => {
                  e.stopPropagation();
                  handlePreview(sound);
                }}
                disabled={loading && previewing === sound.id}
              >
                {previewing === sound.id ? <Loader2 className="animate-spin" /> : <Play />}
              </Button>
            )}
            {value === sound.id && <span className="mt-1 text-xs text-purple-400">Selected</span>}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Volume2 />
        <Slider
          min={0}
          max={100}
          step={1}
          value={volume}
          onValueChange={handleVolume}
          aria-label="Volume"
          className="flex-1"
        />
        <span className="w-10 text-right">{volume}%</span>
        <Button
          size="icon"
          variant="ghost"
          aria-label={volume === 0 ? 'Unmute' : 'Mute'}
          onClick={() => handleVolume(volume === 0 ? 50 : 0)}
        >
          {volume === 0 ? <VolumeX /> : <Volume2 />}
        </Button>
      </div>
    </div>
  );
};
