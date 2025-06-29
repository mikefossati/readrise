import React, { useState } from 'react';
import { Button } from '../ui/button';

interface DurationSelectorProps {
  duration: number;
  onDurationChange: (duration: number) => void;
  disabled?: boolean;
  presets?: readonly number[];
  minDuration?: number;
  maxDuration?: number;
}

const DEFAULT_PRESETS = [15, 25, 45, 60, 90, 120] as const;

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  duration,
  onDurationChange,
  disabled = false,
  presets = DEFAULT_PRESETS,
  minDuration = 1,
  maxDuration = 180,
}) => {
  const [customDuration, setCustomDuration] = useState<string>('');

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomDuration(value);
    
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= minDuration && numValue <= maxDuration) {
      onDurationChange(numValue);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Session Duration
      </label>
      
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 mb-3 justify-center">
        {presets.map((preset) => (
          <Button
            key={preset}
            size="sm"
            variant={duration === preset ? 'default' : 'secondary'}
            onClick={() => onDurationChange(preset)}
            disabled={disabled}
            className="px-3 py-1"
          >
            {preset} min
          </Button>
        ))}
      </div>

      {/* Custom duration input */}
      <div className="flex justify-center">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={`Custom (${minDuration}-${maxDuration} min)`}
          value={customDuration}
          onChange={handleCustomDurationChange}
          disabled={disabled}
          className="w-32 px-3 py-1 rounded-lg bg-slate-700/60 border border-slate-700/50 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400 disabled:opacity-50"
          maxLength={3}
        />
      </div>
      
      {/* Current selection display */}
      <div className="text-center mt-2 text-sm text-gray-400">
        Selected: {duration} minutes
      </div>
    </div>
  );
};
