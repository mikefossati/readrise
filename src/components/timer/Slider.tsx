import React from 'react';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onValueChange: (value: number) => void;
  'aria-label'?: string;
  className?: string;
}

/**
 * Accessible slider component for volume and other numeric controls.
 * Keyboard and screen reader accessible. Compliant with dev_guidelines.md.
 */
export const Slider: React.FC<SliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  onValueChange,
  'aria-label': ariaLabel = 'Slider',
  className = '',
}) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      className={`w-full accent-purple-500 ${className}`}
      onChange={e => onValueChange(Number(e.target.value))}
    />
  );
};
