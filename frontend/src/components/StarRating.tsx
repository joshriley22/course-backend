import './StarRating.css';

export const STAR_COUNT = 5;
export const STAR_PATH = 'M10 1 L12.06 7.17 L18.56 7.22 L13.33 11.08 L15.29 17.28 L10 13.5 L4.71 17.28 L6.67 11.08 L1.44 7.22 L7.94 7.17 Z';

function Star({ fill, size }: { fill: number; size: number }) {
    const pct = Math.round(Math.max(0, Math.min(1, fill)) * 100);
    return (
        <span className='star' style={{ width: size, height: size }}>
            <svg viewBox='0 0 20 20' width={size} height={size}>
                <path d={STAR_PATH} fill='currentColor' />
            </svg>
            <span className='star-fill' style={{ width: `${pct}%` }}>
                <svg viewBox='0 0 20 20' width={size} height={size}>
                    <path d={STAR_PATH} fill='currentColor' />
                </svg>
            </span>
        </span>
    );
}

export function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
    return (
        <span className='star-rating' role='img' aria-label={`${rating} out of ${STAR_COUNT} stars`}>
            {Array.from({ length: STAR_COUNT }, (_, i) => (
                <Star key={i} fill={rating - i} size={size} />
            ))}
        </span>
    );
}
