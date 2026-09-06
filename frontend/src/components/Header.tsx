import './Header.css';

interface HeaderProps {
  codes: string[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  tier: 'major' | 'field' | 'code';
}

export function Header({ codes, currentIndex, onPrev, onNext, tier }: HeaderProps) {

    const code = codes[currentIndex];

  return (
    <header className={`header-bar header-bar--${tier} flex items-center justify-center`}>
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        aria-label="Previous"
        className='header-arrow'
      >
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <span className='header-label'>
        {code}
      </span>

      <button
        onClick={onNext}
        disabled={currentIndex >= codes.length - 1}
        aria-label="Next"
        className='header-arrow'
      >
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path d="m7.5 4.5 5.5 5.5-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </header>
  );
}
