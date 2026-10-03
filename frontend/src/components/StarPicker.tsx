import { useState } from 'react';
import { STAR_COUNT, STAR_PATH } from './StarRating';
import './StarPicker.css';

export interface StarPickerProps {
    value: number;
    onChange: (rating: number) => void;
    size?: number;
    disabled?: boolean;
}

export function StarPicker({ value, onChange, size = 24, disabled = false }: StarPickerProps) {
    const [hovered, setHovered] = useState(0);
    const shown = hovered || value;

    return (
        <div className='star-picker' role='radiogroup' aria-label='Your rating' onMouseLeave={() => setHovered(0)}>
            {Array.from({ length: STAR_COUNT }, (_, i) => {
                const rating = i + 1;
                return (
                    <button
                        key={rating}
                        type='button'
                        role='radio'
                        aria-checked={value === rating}
                        aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
                        className={`star-picker-star${rating <= shown ? ' star-picker-star--on' : ''}`}
                        disabled={disabled}
                        onMouseEnter={() => setHovered(rating)}
                        onClick={() => onChange(rating)}
                    >
                        <svg viewBox='0 0 20 20' width={size} height={size} aria-hidden='true'>
                            <path d={STAR_PATH} fill='currentColor' />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}
