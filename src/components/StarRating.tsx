import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number; // Current rating (1-5, or 0 for unrated)
  average?: number; // Optional, for showing average rating (readonly)
  onChange?: (rating: number) => void; // Called when user clicks a star
  disabled?: boolean;
  size?: number; // px
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  average,
  onChange,
  disabled = false,
  size = 24,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  // If showing average only (readonly):
  const displayValue = typeof average === 'number' && !onChange ? average : (hovered ?? value);

  return (
    <div className="flex items-center gap-1 select-none">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = displayValue >= star;
        return (
          <span
            key={star}
            className={`transition-transform duration-150 ${!disabled && onChange ? 'cursor-pointer' : ''}`}
            style={{
              transform: hovered === star ? 'scale(1.18)' : 'scale(1)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={() => !disabled && onChange && setHovered(star)}
            onMouseLeave={() => !disabled && onChange && setHovered(null)}
            onClick={() => !disabled && onChange && onChange(star)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            tabIndex={onChange && !disabled ? 0 : -1}
            onKeyDown={e => {
              if ((e.key === 'Enter' || e.key === ' ') && onChange && !disabled) onChange(star);
            }}
          >
            <Star
              fill={filled ? '#facc15' : 'none'}
              stroke="#facc15"
              width={size}
              height={size}
              className={`drop-shadow-sm ${filled ? 'star-filled' : 'star-empty'}`}
              style={{
                filter: filled ? 'drop-shadow(0 0 6px #fde68a)' : undefined,
                transition: 'fill 0.2s, filter 0.2s',
              }}
            />
          </span>
        );
      })}
      {typeof average === 'number' && (
        <span className="ml-2 text-xs text-yellow-400/80">{average.toFixed(2)}</span>
      )}
    </div>
  );
};
